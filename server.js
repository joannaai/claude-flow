if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const https      = require('https');
const path       = require('path');
const fs         = require('fs');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const { Resend } = require('resend');
const session      = require('express-session');
const PgSession     = require('connect-pg-simple')(session);
const bcrypt       = require('bcryptjs');
const { pool, init } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;
const NOTICE_CC_EMAIL = 'aicomanagementllc@gmail.com';

app.use(cors());
app.use((req, res, next) => {
    // Allow the Zillow-page ingest script (public HTTPS origin) to reach this private/loopback server
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    next();
});
app.use(express.json());
app.use(session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
}));

// ── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

        // Bootstrap-only: registration closes itself once the first account exists.
        const existing = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(existing.rows[0].count, 10) > 0) {
            return res.status(403).json({ error: 'Registration is closed. Ask an existing user for access.' });
        }

        const hash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1,$2) RETURNING id',
            [username, hash]
        );
        req.session.userId = result.rows[0].id;
        req.session.username = username;
        res.json({ success: true, username });
    } catch (e) {
        if (e.code === '23505') return res.status(409).json({ error: 'Username already taken' });
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const result = await pool.query('SELECT id, password_hash FROM users WHERE username = $1', [username]);
        const match = result.rows.length && await bcrypt.compare(password, result.rows[0].password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid username or password' });

        req.session.userId = result.rows[0].id;
        req.session.username = username;
        res.json({ success: true, username });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/auth/me', async (req, res) => {
    if (req.session && req.session.userId) {
        return res.json({ authenticated: true, username: req.session.username });
    }
    try {
        const existing = await pool.query('SELECT COUNT(*) FROM users');
        res.json({ authenticated: false, registrationOpen: parseInt(existing.rows[0].count, 10) === 0 });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Serve the standalone Tenant Notices site at its own domain's root instead of
// the main blog's index.html. Add more hostnames here as more get pointed here.
// Locally, the root still shows the full main site by default — test the
// standalone site via /letter.html directly, or by spoofing the Host header.
const LETTER_SITE_HOSTNAMES = ['file.aicomanage.org'];
const isLoggedIn = req => !!(req.session && req.session.userId);

app.get('/', (req, res, next) => {
    if (LETTER_SITE_HOSTNAMES.includes(req.hostname)) {
        return res.sendFile(path.join(__dirname, isLoggedIn(req) ? 'letter.html' : 'login.html'));
    }
    next();
});
app.get('/letter.html', (req, res) => {
    res.sendFile(path.join(__dirname, isLoggedIn(req) ? 'letter.html' : 'login.html'));
});

app.use(express.static('.'));

const DMV_LOCATIONS = [
    'Washington DC', 'Arlington VA', 'Alexandria VA',
    'Bethesda MD', 'Silver Spring MD', 'Rockville MD',
    'McLean VA', 'Fairfax VA'
];

// ── Houses ───────────────────────────────────────────────────────────────────

function fetchListingsForArea(location, apiKey) {
    return new Promise((resolve) => {
        const query = new URLSearchParams({ location, status: 'FOR_SALE', sort: 'price_low', limit: '40' });
        const options = {
            hostname: 'real-estate101.p.rapidapi.com',
            path: `/api/search?${query}`,
            method: 'GET',
            headers: { 'x-rapidapi-host': 'real-estate101.p.rapidapi.com', 'x-rapidapi-key': apiKey }
        };
        const req = https.request(options, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                try {
                    const results = JSON.parse(body).results || [];
                    resolve(results.map(h => ({
                        zpid:      h.id,
                        address:   h.address?.street,
                        city:      h.address?.city,
                        state:     h.address?.state,
                        zipcode:   h.address?.zipcode,
                        price:     h.unformattedPrice,
                        zestimate: h.zestimate || h.taxAssessedValue,
                        beds:      h.beds,
                        baths:     h.baths,
                        sqft:      h.livingArea || h.area,
                        homeType:  h.homeType,
                        imageUrl:  h.imgSrc,
                        detailUrl: h.detailUrl,
                        status:    h.homeStatus || 'FOR_SALE',
                    })));
                } catch (_) { resolve([]); }
            });
        });
        req.on('error', () => resolve([]));
        req.end();
    });
}

async function fetchListings() {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) throw new Error('RAPIDAPI_KEY environment variable not set');

    const results = await Promise.all(
        DMV_LOCATIONS.map(area =>
            fetchListingsForArea(area, apiKey).then(list => {
                console.log(`  ${area}: ${list.length} listings`);
                return list.map(h => ({ ...h, area }));
            })
        )
    );
    return results.flat();
}

function formatHomeType(t) {
    return ({ SINGLE_FAMILY: 'Single Family', CONDO: 'Condo', TOWNHOUSE: 'Townhouse',
              MULTI_FAMILY: 'Multi Family', MANUFACTURED: 'Manufactured' })[t] || t;
}

async function getDailyHouses() {
    const today = new Date().toDateString();

    const cached = await pool.query('SELECT * FROM houses_cache WHERE date = $1 LIMIT 1', [today]);
    if (cached.rows.length > 0) return { date: today, houses: cached.rows[0].houses };

    // Serve everything from the houses table while waiting for a fresh API pull —
    // the frontend's own "Show N / Show All" dropdown handles display limits.
    const existing = await pool.query(`
        SELECT zpid AS id, address, city, state, area, type, beds, baths, sqft,
               zipcode, listed_price AS "listedPrice", market_price AS "marketPrice",
               savings, discount_pct AS "discountPct", image_url AS "imageUrl",
               detail_url AS "detailUrl", status, first_seen_at AS "firstSeenAt", scraped_at, updated_at
        FROM houses ORDER BY discount_pct DESC
    `);
    if (existing.rows.length > 0) return { date: today, houses: existing.rows };

    console.log('Scraping DMV listings from Zillow...');
    const allResults = await fetchListings();

    const seen = new Set();
    const unique = allResults.filter(h => { if (!h.zpid || seen.has(h.zpid)) return false; seen.add(h.zpid); return true; });

    const deals = unique
        .filter(h => h.price > 0)
        .map(h => {
            const market = h.zestimate || 0;
            const discountPct = market > 0 ? Math.round((1 - h.price / market) * 100) : 0;
            return {
                zpid: h.zpid,
                address: h.address,
                city: `${h.city}, ${h.state} ${h.zipcode}`,
                state: h.state,
                area: h.area,
                type: formatHomeType(h.homeType),
                beds: h.beds, baths: h.baths,
                sqft: h.sqft,
                listedPrice: h.price,
                marketPrice: market || h.price,
                savings: market > 0 ? market - h.price : 0,
                discountPct,
                imageUrl: h.imageUrl || null,
                detailUrl: h.detailUrl,
                status: h.status || 'FOR_SALE'
            };
        });

    // Upsert each property — only update if price or status changed
    for (const h of deals) {
        await pool.query(`
            INSERT INTO houses (zpid, address, city, state, area, type, beds, baths, sqft,
                listed_price, market_price, savings, discount_pct, image_url, detail_url, status, scraped_at, updated_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW())
            ON CONFLICT (zpid) DO UPDATE SET
                listed_price = EXCLUDED.listed_price,
                market_price = EXCLUDED.market_price,
                savings      = EXCLUDED.savings,
                discount_pct = EXCLUDED.discount_pct,
                status       = EXCLUDED.status,
                updated_at   = CASE
                    WHEN houses.listed_price <> EXCLUDED.listed_price OR houses.status <> EXCLUDED.status
                    THEN NOW() ELSE houses.updated_at END
            WHERE houses.listed_price <> EXCLUDED.listed_price OR houses.status <> EXCLUDED.status
        `, [h.zpid, h.address, h.city, h.state, h.area, h.type, h.beds, h.baths, h.sqft,
            h.listedPrice, h.marketPrice, h.savings, h.discountPct, h.imageUrl, h.detailUrl, h.status]);
    }

    // Read everything from DB sorted by discount
    const rows = await pool.query(`
        SELECT zpid AS id, address, city, state, area, type, beds, baths, sqft,
               zipcode, listed_price AS "listedPrice", market_price AS "marketPrice",
               savings, discount_pct AS "discountPct", image_url AS "imageUrl",
               detail_url AS "detailUrl", status, first_seen_at AS "firstSeenAt", scraped_at, updated_at
        FROM houses
        ORDER BY discount_pct DESC
    `);

    const allHouses = rows.rows;
    console.log(`Upserted ${deals.length} listings, serving ${allHouses.length} from DB`);
    await pool.query('INSERT INTO houses_cache (date, houses) VALUES ($1, $2) ON CONFLICT (date) DO NOTHING', [today, JSON.stringify(allHouses)]);
    return { date: today, houses: allHouses };
}

app.get('/api/houses', async (req, res) => {
    try { res.json(await getDailyHouses()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

// Manual ingest: accepts listings extracted from a real browser session and upserts them
app.post('/api/houses/ingest', async (req, res) => {
    try {
        const { area, listings } = req.body;
        if (!area || !Array.isArray(listings)) return res.status(400).json({ error: 'area and listings[] required' });
        const result = await upsertListings(listings.map(h => ({ ...h, area })));
        console.log(`  [manual ingest] ${area}: ${result.total} total, ${result.newCount} new, ${result.updatedCount} updated`);
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

async function upsertListings(allResults) {
    const seen = new Set();
    const unique = allResults.filter(h => { if (!h.zpid || seen.has(h.zpid)) return false; seen.add(h.zpid); return true; });
    const deals = unique.filter(h => h.price > 0).map(h => {
        const market = h.zestimate || 0;
        const discountPct = market > 0 ? Math.round((1 - h.price / market) * 100) : 0;
        return { zpid: h.zpid, address: h.address, city: `${h.city}, ${h.state}`,
            zipcode: h.zipcode, state: h.state, area: h.area, type: formatHomeType(h.homeType),
            beds: h.beds, baths: h.baths, sqft: h.sqft, listedPrice: h.price,
            marketPrice: market || h.price, savings: market > 0 ? market - h.price : 0,
            discountPct, imageUrl: h.imageUrl || null, detailUrl: h.detailUrl,
            status: h.status || 'FOR_SALE' };
    });

    let newCount = 0, updatedCount = 0;
    for (const h of deals) {
        const result = await pool.query(`
            INSERT INTO houses (zpid,address,city,zipcode,state,area,type,beds,baths,sqft,
                listed_price,market_price,savings,discount_pct,image_url,detail_url,
                status,first_seen_at,scraped_at,updated_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW(),NOW(),NOW())
            ON CONFLICT (zpid) DO UPDATE SET
                listed_price  = EXCLUDED.listed_price,
                market_price  = EXCLUDED.market_price,
                savings       = EXCLUDED.savings,
                discount_pct  = EXCLUDED.discount_pct,
                status        = EXCLUDED.status,
                scraped_at     = NOW(),
                updated_at    = CASE
                    WHEN houses.listed_price <> EXCLUDED.listed_price OR houses.status <> EXCLUDED.status
                    THEN NOW() ELSE houses.updated_at END
            WHERE houses.listed_price <> EXCLUDED.listed_price OR houses.status <> EXCLUDED.status
            RETURNING (xmax = 0) AS inserted
        `, [h.zpid,h.address,h.city,h.zipcode,h.state,h.area,h.type,h.beds,h.baths,h.sqft,
            h.listedPrice,h.marketPrice,h.savings,h.discountPct,h.imageUrl,h.detailUrl,h.status]);
        if (result.rows.length > 0) {
            result.rows[0].inserted ? newCount++ : updatedCount++;
        }
    }
    return { total: deals.length, newCount, updatedCount };
}

// Force a fresh listings pull regardless of cache
app.post('/api/houses/scrape', async (req, res) => {
    res.json({ message: 'Scrape started — check server logs for progress' });
    try {
        const today = new Date().toDateString();
        await pool.query('DELETE FROM houses_cache WHERE date = $1', [today]);
        console.log('Manual scrape triggered...');

        const apiKey = process.env.RAPIDAPI_KEY;
        if (!apiKey) throw new Error('RAPIDAPI_KEY environment variable not set');

        await Promise.all(DMV_LOCATIONS.map(async area => {
            const list = await fetchListingsForArea(area, apiKey);
            const { total, newCount, updatedCount } = await upsertListings(list.map(h => ({ ...h, area })));
            console.log(`  ${area}: ${total} total, ${newCount} new, ${updatedCount} updated`);
        }));
        console.log('Scrape complete');
    } catch (e) {
        console.error('Scrape error:', e.message);
    }
});


// Serve static houses.json file directly (for client-side fetch)
app.get('/houses.json', async (req, res) => {
    try { res.json(await getDailyHouses()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

// Proxy Zillow photos to avoid CORS
app.get('/api/house-photo', (req, res) => {
    const photoUrl = req.query.url;
    if (!photoUrl) return res.status(400).send('Missing url param');
    function fetch(url) {
        https.get(url, imgRes => {
            if (imgRes.statusCode === 301 || imgRes.statusCode === 302) return fetch(imgRes.headers.location);
            res.set('Content-Type', imgRes.headers['content-type'] || 'image/jpeg');
            res.set('Cache-Control', 'public, max-age=86400');
            imgRes.pipe(res);
        }).on('error', () => res.status(500).send('Photo unavailable'));
    }
    fetch(photoUrl);
});

// ── Letters ──────────────────────────────────────────────────────────────────

// Records a generated/sent notice so it shows up on the Letter History page.
// Logging failures are swallowed — they should never block the actual send.
async function logLetterHistory({ letterType, tenantName, tenantEmail, rentAmount, action }) {
    try {
        await pool.query(
            'INSERT INTO letter_history (letter_type, tenant_name, tenant_email, rent_amount, action) VALUES ($1,$2,$3,$4,$5)',
            [letterType, tenantName || null, tenantEmail || null, rentAmount ? Number(rentAmount) : null, action]
        );
    } catch (e) {
        console.error('Failed to log letter history:', e.message);
    }
}

app.get('/api/letter/history', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, letter_type, tenant_name, tenant_email, rent_amount, action, created_at FROM letter_history ORDER BY created_at DESC LIMIT 200'
        );
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

function formatMonthYear(isoDate) {
    if (!isoDate) return '';
    const [y, m] = isoDate.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function formatShortDate(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    return `${m}/${d}/${y}`;
}

// Plain-text version of the MD notice content, used as the email body so the tenant
// sees the full notice inline rather than only in the PDF attachment.
function buildMdNoticeText(d) {
    const fmt = n => '$' + Number(n || 0).toFixed(2);
    const total = (parseFloat(d.rentAmount) || 0) + (parseFloat(d.lateFeeAmount) || 0);
    const lines = [
        'NOTICE OF INTENT TO FILE A COMPLAINT FOR SUMMARY EJECTMENT (Failure to Pay Rent)',
        '(Real Property Article §8-401(c))',
        '',
        'FROM: Landlord/Agent',
        d.landlordName,
        d.landlordAddress,
        d.landlordCityStateZip,
        d.landlordPhone ? `Tel: ${d.landlordPhone}` : '',
        d.landlordEmail ? `Email: ${d.landlordEmail}` : '',
        '',
        'TO: Tenant(s)',
        d.tenant1 + (d.tenant2 ? ', ' + d.tenant2 : ''),
        d.tenantAddress,
        d.tenantCityStateZip,
        d.tenantPhone ? `Tel: ${d.tenantPhone}` : '',
        d.tenantEmail ? `Email: ${d.tenantEmail}` : '',
        '',
        'THIS IS NOT A NOTICE OF EVICTION',
        'An action for repossession of the property may be initiated if the total amount listed below is not paid within 10 days after the landlord provides this notice. You have a legal right to dispute the charges.',
        '',
        `${fmt(d.rentAmount)} rent for the ${formatMonthYear(d.rentFrom)} to ${formatMonthYear(d.rentTo)}`,
        d.lateFeeAmount ? `${fmt(d.lateFeeAmount)} late fee for the ${formatMonthYear(d.lateFeeFrom)} to ${formatMonthYear(d.lateFeeTo)}` : '',
        `TOTAL: ${fmt(total)}`,
        '',
        '*Due pursuant to the terms of your lease. Does not include other charges related to utilities, services, other fees, fines, and court costs.',
        'At your request, the landlord must promptly provide you an itemized accounting of debits and credits (rental ledger) showing how the amount you owe came to be.',
        '',
        'DATE AND METHOD OF PROVIDING NOTICE',
        `This notice is being provided to the tenant by the landlord on ${formatShortDate(d.noticeDate)} by: ${d.deliveryMethod}`,
        '',
        `Date: ${formatShortDate(d.noticeDate)}`,
        'Signature: (see attached signed PDF)',
        '',
        'RESOURCES FOR TENANTS AND LANDLORDS',
        '- Under the Access to Counsel in Evictions Law, all income qualified tenants will have access to an attorney. Call 211 for a referral or visit legalhelp.org.',
        '- Alternative Dispute Resolution (ADR) Office: mdcourts.gov/district/adr/home. Mediation is available before and after a failure-to-pay-rent case is filed in the District Court of Maryland.',
        '- Rental assistance may be available to both Tenants and Landlords. Visit mdcourts.gov/legalhelp/housing.',
        '- Speak with a lawyer for free at a Maryland Court Help Center. Visit mdcourts.gov/helpcenter or call 410-260-1392.',
        '',
        'DC-CV-115 (Rev. 10/2024)',
        '',
        'A signed PDF copy of this notice is also attached.',
    ];
    return lines.filter(l => l !== undefined).join('\n');
}

// Fills the official Maryland DC-CV-115 form (Notice of Intent to File a Complaint
// for Summary Ejectment — Failure to Pay Rent) with the submitted data. Returns PDF bytes.
async function fillMdNoticePdf(d) {
    const bytes = fs.readFileSync(path.join(__dirname, 'forms', 'dccv115.pdf'));
    const pdfDoc = await PDFDocument.load(bytes);
    const form = pdfDoc.getForm();

    const setText = (field, value) => { if (value) form.getTextField(field).setText(String(value)); };
    const check = (field) => form.getCheckBox(field).check();

    setText('Landlord/Agent Name', d.landlordName);
    setText('Landlord/Agent Address', d.landlordAddress);
    setText('City, State, Zip', d.landlordCityStateZip);
    setText('Landlord/Agent Telephone Number', d.landlordPhone);
    setText('E-mail Address', d.landlordEmail);

    setText('Tenant #1', d.tenant1);
    setText('Tenant #2', d.tenant2);
    setText('Tenant Address', d.tenantAddress);
    setText('City, State, Zip_1', d.tenantCityStateZip);
    setText('Tenant Telephone Number', d.tenantPhone);
    setText('Tenant Email Address #1', d.tenantEmail);

    const fmt = n => '$' + Number(n || 0).toFixed(2);
    setText('Past-due rent', fmt(d.rentAmount));
    setText('From (Day)', formatMonthYear(d.rentFrom));
    setText('To (Day)', formatMonthYear(d.rentTo));
    check(d.rentUnit === 'weeks' ? 'Check Box32' : 'checkbox31');

    if (d.lateFeeAmount) {
        setText('Late Fees', fmt(d.lateFeeAmount));
        setText('From (day)_1', formatMonthYear(d.lateFeeFrom));
        setText('to (day)_1', formatMonthYear(d.lateFeeTo));
        check(d.lateFeeUnit === 'weeks' ? 'Check Box34' : 'Check Box33');
    }

    const total = (parseFloat(d.rentAmount) || 0) + (parseFloat(d.lateFeeAmount) || 0);
    setText('Total Due', fmt(total));
    setText('Date of Notice Provided', formatShortDate(d.noticeDate));
    setText('Date_2', formatShortDate(d.noticeDate));

    const deliveryCheckboxes = {
        'First-class mail or mail service of mailing': ['Check Box35'],
        'Affixed to the door of the leased property': ['Check Box36'],
        'Delivered electronically by e-mail message': ['Check Box37', 'Check Box38'],
        'Delivered electronically by text message': ['Check Box37', 'Check Box39'],
        'Delivered electronically via tenant portal': ['Check Box37', 'Check Box40'],
    };
    (deliveryCheckboxes[d.deliveryMethod] || []).forEach(check);

    // Draw the signature image over the "Signature of Landlord/Attorney/Agent" line
    const sigField = form.getTextField('Signature of Landlord/Attorney/Agent');
    const sigRect = sigField.acroField.getWidgets()[0].getRectangle();
    const sigBytes = fs.readFileSync(path.join(__dirname, 'forms', 'signature.png'));
    const sigImage = await pdfDoc.embedPng(sigBytes);
    const sigHeight = 18.2;
    const sigWidth = sigHeight * (sigImage.width / sigImage.height);
    const page = pdfDoc.getPage(0);
    page.drawImage(sigImage, {
        x: sigRect.x + (sigRect.width - sigWidth) / 2,
        y: sigRect.y,
        width: sigWidth,
        height: sigHeight,
    });

    return pdfDoc.save();
}

// Plain-text version of the VA notice content, used as the email body so the tenant
// sees the full notice inline rather than only in the PDF attachment.
function buildVaNoticeText(d) {
    const fmt = n => '$' + Number(n || 0).toFixed(2);
    const lines = [
        '14-DAY NOTICE TO PAY RENT OR QUIT',
        '(Nonpayment of Rent — Va. Code § 55.1-1245)',
        '',
        'FROM: Landlord/Agent',
        d.landlordName,
        d.landlordAddress,
        d.landlordCityStateZip,
        d.landlordPhone ? `Tel: ${d.landlordPhone}` : '',
        d.landlordEmail ? `Email: ${d.landlordEmail}` : '',
        '',
        'TO: Tenant(s)',
        d.tenant1 + (d.tenant2 ? ', ' + d.tenant2 : ''),
        d.tenantAddress,
        d.tenantCityStateZip,
        d.tenantPhone ? `Tel: ${d.tenantPhone}` : '',
        d.tenantEmail ? `Email: ${d.tenantEmail}` : '',
        '',
        'You are hereby notified that you have failed to pay rent as required under your rental agreement. The rent set forth below remains unpaid:',
        '',
        `${fmt(d.rentAmount)} rent for the ${d.rentPeriod}   ${d.rentFrom} to ${d.rentTo}`,
        `TOTAL DUE: ${fmt(d.rentAmount)}`,
        '',
        'You have FOURTEEN (14) DAYS from the date of this notice to pay the total amount due. If the rent is not paid in full within this 14-day period, the landlord intends to terminate the rental agreement and may file an unlawful detainer action in the Prince William County General District Court to obtain possession of the premises. This notice is provided pursuant to Va. Code § 55.1-1245.',
        '',
        'DATE AND METHOD OF PROVIDING NOTICE',
        `This notice is being provided to the tenant by the landlord on ${d.noticeDate} by ${d.deliveryMethod}.`,
        '',
        `Date: ${d.noticeDate}`,
        'Signature: (see attached signed PDF)',
        '',
        'This is a template based on current Virginia statutory requirements and is not a substitute for advice from a Virginia-licensed attorney. Verify current requirements before relying on this notice in a legal proceeding.',
        '',
        'A signed PDF copy of this notice is also attached.',
    ];
    return lines.filter(l => l !== undefined).join('\n');
}

// Builds the Virginia 14-day pay-or-quit notice (Va. Code § 55.1-1245) from scratch —
// there is no official state PDF form to fill, unlike Maryland's DC-CV-115.
async function fillVaNoticePdf(d) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const marginX = 54;
    const maxWidth = 612 - marginX * 2;
    let page = pdfDoc.addPage([612, 792]);
    let y = 742;

    const wrapText = (text, size, useFont) => {
        const words = String(text).split(/\s+/);
        const lines = [];
        let current = '';
        words.forEach(word => {
            const test = current ? current + ' ' + word : word;
            if (current && useFont.widthOfTextAtSize(test, size) > maxWidth) {
                lines.push(current);
                current = word;
            } else {
                current = test;
            }
        });
        if (current) lines.push(current);
        return lines;
    };

    const writeLine = (text, opts = {}) => {
        const size = opts.size || 11;
        const useFont = opts.bold ? boldFont : font;
        const lineHeight = opts.lineHeight || 15;
        wrapText(text, size, useFont).forEach(line => {
            if (y < 50) { page = pdfDoc.addPage([612, 792]); y = 742; }
            const x = opts.center ? (612 - useFont.widthOfTextAtSize(line, size)) / 2 : marginX;
            page.drawText(line, { x, y, size, font: useFont });
            y -= lineHeight;
        });
    };

    const fmt = n => '$' + Number(n || 0).toFixed(2);

    writeLine('14-DAY NOTICE TO PAY RENT OR QUIT', { bold: true, size: 13, center: true });
    writeLine('(Nonpayment of Rent — Va. Code § 55.1-1245)', { size: 9, center: true });
    y -= 8;

    writeLine('FROM: Landlord/Agent', { bold: true });
    writeLine(d.landlordName);
    writeLine(d.landlordAddress);
    writeLine(d.landlordCityStateZip + (d.landlordPhone ? '   Tel: ' + d.landlordPhone : ''));
    if (d.landlordEmail) writeLine('Email: ' + d.landlordEmail);
    y -= 6;

    writeLine('TO: Tenant(s)', { bold: true });
    writeLine(d.tenant1 + (d.tenant2 ? ', ' + d.tenant2 : ''));
    writeLine(d.tenantAddress);
    writeLine(d.tenantCityStateZip + (d.tenantPhone ? '   Tel: ' + d.tenantPhone : ''));
    if (d.tenantEmail) writeLine('Email: ' + d.tenantEmail);
    y -= 10;

    writeLine('You are hereby notified that you have failed to pay rent as required under your rental agreement. The rent set forth below remains unpaid:');
    y -= 4;
    writeLine(`${fmt(d.rentAmount)} rent for the ${d.rentPeriod}   ${d.rentFrom} to ${d.rentTo}`);
    writeLine(`TOTAL DUE: ${fmt(d.rentAmount)}`, { bold: true });
    y -= 8;

    writeLine('You have FOURTEEN (14) DAYS from the date of this notice to pay the total amount due. If the rent is not paid in full within this 14-day period, the landlord intends to terminate the rental agreement and may file an unlawful detainer action in the Prince William County General District Court to obtain possession of the premises. This notice is provided pursuant to Va. Code § 55.1-1245.', { bold: true });
    y -= 8;

    writeLine('DATE AND METHOD OF PROVIDING NOTICE', { bold: true });
    writeLine(`This notice is being provided to the tenant by the landlord on ${d.noticeDate} by ${d.deliveryMethod}.`);
    y -= 10;

    // Date / signature line — drawn as two separate text runs so the landlord's
    // signature image (same one used on the MD/Prince George's County notice)
    // can be overlaid on the signature portion.
    const dateText = `Date: ${d.noticeDate}`;
    const sigLabel = 'Signature: ';
    const sigLabelX = marginX + 250;
    page.drawText(dateText, { x: marginX, y, size: 11, font });
    page.drawText(sigLabel, { x: sigLabelX, y, size: 11, font });

    const sigBytes = fs.readFileSync(path.join(__dirname, 'forms', 'signature.png'));
    const sigImage = await pdfDoc.embedPng(sigBytes);
    const sigHeight = 16;
    const sigWidth = sigHeight * (sigImage.width / sigImage.height);
    const sigLabelWidth = font.widthOfTextAtSize(sigLabel, 11);
    page.drawImage(sigImage, {
        x: sigLabelX + sigLabelWidth,
        y: y - 3,
        width: sigWidth,
        height: sigHeight,
    });
    y -= 14;

    writeLine('This is a template based on current Virginia statutory requirements and is not a substitute for advice from a Virginia-licensed attorney. Verify current requirements before relying on this notice in a legal proceeding.', { size: 8 });

    return pdfDoc.save();
}

app.post('/api/letter/va-notice-pdf', async (req, res) => {
    try {
        const outBytes = await fillVaNoticePdf(req.body);
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename="va-pay-or-quit-notice.pdf"');
        res.send(Buffer.from(outBytes));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Emails the Virginia pay-or-quit notice as a PDF attachment directly to the tenant
app.post('/api/letter/va-notice-send', async (req, res) => {
    try {
        const d = req.body;
        if (!d.tenantEmail) return res.status(400).json({ error: 'Tenant email address is required to send' });
        if (!process.env.RESEND_API_KEY) {
            return res.status(500).json({ error: 'Email is not configured (missing RESEND_API_KEY)' });
        }

        const outBytes = await fillVaNoticePdf(d);

        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        const { error } = await resend.emails.send({
            from: `${d.landlordName || 'Landlord'} <${fromAddress}>`,
            to: d.tenantEmail,
            cc: NOTICE_CC_EMAIL,
            subject: '14-Day Notice to Pay Rent or Quit',
            text: buildVaNoticeText(d),
            attachments: [{ filename: 'va-pay-or-quit-notice.pdf', content: Buffer.from(outBytes) }],
        });
        if (error) throw new Error(error.message || 'Resend failed to send the email');

        await logLetterHistory({
            letterType: 'va-pay-or-quit',
            tenantName: d.tenant1,
            tenantEmail: d.tenantEmail,
            rentAmount: d.rentAmount,
            action: 'emailed',
        });

        res.json({ success: true, sentTo: d.tenantEmail });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/letter/md-notice-pdf', async (req, res) => {
    try {
        const outBytes = await fillMdNoticePdf(req.body);
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename="md-notice-of-intent.pdf"');
        res.send(Buffer.from(outBytes));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Emails the filled notice as a PDF attachment directly to the tenant
app.post('/api/letter/md-notice-send', async (req, res) => {
    try {
        const d = req.body;
        if (!d.tenantEmail) return res.status(400).json({ error: 'Tenant email address is required to send' });
        if (!process.env.RESEND_API_KEY) {
            return res.status(500).json({ error: 'Email is not configured (missing RESEND_API_KEY)' });
        }

        const outBytes = await fillMdNoticePdf(d);

        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        const { error } = await resend.emails.send({
            from: `${d.landlordName || 'Landlord'} <${fromAddress}>`,
            to: d.tenantEmail,
            cc: NOTICE_CC_EMAIL,
            subject: 'Notice of Intent to File a Complaint for Summary Ejectment (Failure to Pay Rent)',
            text: buildMdNoticeText(d),
            attachments: [{ filename: 'md-notice-of-intent.pdf', content: Buffer.from(outBytes) }],
        });
        if (error) throw new Error(error.message || 'Resend failed to send the email');

        await logLetterHistory({
            letterType: 'md-cv115',
            tenantName: d.tenant1,
            tenantEmail: d.tenantEmail,
            rentAmount: d.rentAmount,
            action: 'emailed',
        });

        res.json({ success: true, sentTo: d.tenantEmail });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── Contact submissions ───────────────────────────────────────────────────────

app.post('/api/submit-contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message)
            return res.status(400).json({ error: 'Missing required fields' });
        const timestamp = new Date().toLocaleString();
        await pool.query(
            'INSERT INTO submissions (name, email, subject, message, timestamp) VALUES ($1,$2,$3,$4,$5)',
            [name, email, subject, message, timestamp]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/submissions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM submissions ORDER BY id DESC');
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/delete-submission/:index', async (req, res) => {
    try {
        // index-based deletion: fetch all ordered by id, delete the nth one
        const idx = parseInt(req.params.index);
        const all = await pool.query('SELECT id FROM submissions ORDER BY id DESC');
        if (idx < 0 || idx >= all.rows.length) return res.status(400).json({ error: 'Invalid index' });
        await pool.query('DELETE FROM submissions WHERE id = $1', [all.rows[idx].id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/clear-submissions', async (req, res) => {
    try {
        await pool.query('DELETE FROM submissions');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// ── Poetry ────────────────────────────────────────────────────────────────────

app.post('/api/generate-poem', async (req, res) => {
    try {
        const { words } = req.body;
        if (!words || !Array.isArray(words) || words.length < 5)
            return res.status(400).json({ error: 'Need at least 5 words' });
        const prompt = `Create a beautiful, evocative 8-12 line poem using these words: ${words.join(', ')}. The poem should be emotional, meaningful, and cohesive. Respond with ONLY the poem text, no title or explanation.`;
        const poem = await callClaudeAPI(prompt);
        res.json({ success: true, poem, words });
    } catch (e) {
        res.status(500).json({ error: 'Failed to generate poem', details: e.message });
    }
});

app.post('/api/generate-image', async (req, res) => {
    try {
        const { poem } = req.body;
        if (!poem) return res.status(400).json({ error: 'Poem required' });
        const theme    = await callClaudeAPI(`Extract the main theme or visual mood of this poem in one short phrase (max 10 words): "${poem}"`);
        const imageUrl = await callHuggingFaceAPI(theme);
        res.json({ success: true, imageUrl, theme });
    } catch (e) {
        res.status(500).json({ error: 'Failed to generate image', details: e.message });
    }
});

app.post('/api/save-poem', async (req, res) => {
    try {
        const { words, poem, theme, imageUrl, score } = req.body;
        const id = Date.now().toString();
        await pool.query(
            'INSERT INTO poems (id, words, poem, theme, image_url, score) VALUES ($1,$2,$3,$4,$5,$6)',
            [id, JSON.stringify(words), poem, theme, imageUrl || '', score || 0]
        );
        res.json({ success: true, poem: { id, words, poem, theme, imageUrl, score } });
    } catch (e) { res.status(500).json({ error: 'Failed to save poem' }); }
});

app.get('/api/gallery', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM poems ORDER BY timestamp DESC LIMIT 10');
        res.json(result.rows.map(r => ({
            id: r.id, words: r.words, poem: r.poem, theme: r.theme,
            imageUrl: r.image_url, score: r.score, timestamp: r.timestamp
        })));
    } catch (e) { res.status(500).json({ error: 'Failed to load gallery' }); }
});

app.post('/api/delete-poem/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM poems WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Failed to delete poem' }); }
});

// ── Claude & Hugging Face helpers ─────────────────────────────────────────────

function callClaudeAPI(prompt) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) return reject(new Error('CLAUDE_API_KEY not set'));
        const data = JSON.stringify({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] });
        const req = https.request({
            hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    if (res.statusCode !== 200) return reject(new Error(`Claude API error (${res.statusCode})`));
                    const json = JSON.parse(body);
                    resolve(json.content[0].text);
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function callHuggingFaceAPI(theme) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.HUGGING_FACE_API_KEY;
        if (!apiKey) {
            console.warn('HUGGING_FACE_API_KEY not set, using placeholder');
            return resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBHZW5lcmF0aW9uIERpc2FibGVkPC90ZXh0Pjwvc3ZnPg==');
        }
        const data = JSON.stringify({ inputs: `A beautiful illustration representing: ${theme}. Style: digital art, vibrant` });
        const req = https.request({
            hostname: 'api-inference.huggingface.co',
            path: '/models/stabilityai/stable-diffusion-2', method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
        }, res => {
            let body = '';
            res.on('data', c => body += c.toString('binary'));
            res.on('end', () => {
                try { resolve(`data:image/jpeg;base64,${Buffer.from(body, 'binary').toString('base64')}`); }
                catch (e) { reject(new Error('Failed to process image')); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// ── Midnight cache refresh ────────────────────────────────────────────────────

function scheduleMidnightRefresh() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 1, 0);
    setTimeout(async () => {
        console.log('Houses: midnight auto-refresh starting...');
        try {
            await pool.query('DELETE FROM houses_cache');
            if (process.env.RAPIDAPI_KEY) {
                const data = await getDailyHouses();
                console.log(`Houses: midnight refresh done — ${data.houses.length} listings saved`);
            }
        } catch (e) { console.error('Houses: midnight refresh failed:', e.message); }
        scheduleMidnightRefresh();
    }, midnight - now);
    console.log(`Houses: next auto-refresh in ${((midnight - now) / 3600000).toFixed(1)}h`);
}

// ── Start ─────────────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET');
    init().then(() => {
        scheduleMidnightRefresh();
        if (process.env.RAPIDAPI_KEY) getDailyHouses().catch(e => console.error('Houses pre-fetch failed:', e.message));
    }).catch(e => {
        console.error('Failed to initialize database:', e.message || e);
    });
});
