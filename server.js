const express = require('express');
const cors    = require('cors');
const https   = require('https');
const path    = require('path');
const { pool, init } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const DMV_LOCATIONS = [
    'Washington DC', 'Arlington VA', 'Alexandria VA',
    'Bethesda MD', 'Silver Spring MD', 'Rockville MD',
    'McLean VA', 'Fairfax VA'
];

// ── Houses ───────────────────────────────────────────────────────────────────

function fetchListings(location, apiKey) {
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
                try { resolve(JSON.parse(body).results || []); } catch (_) { resolve([]); }
            });
        });
        req.on('error', () => resolve([]));
        req.end();
    });
}

function formatHomeType(t) {
    return ({ SINGLE_FAMILY: 'Single Family', CONDO: 'Condo', TOWNHOUSE: 'Townhouse',
              MULTI_FAMILY: 'Multi Family', MANUFACTURED: 'Manufactured' })[t] || t;
}

async function getDailyHouses() {
    const today = new Date().toDateString();

    // Check DB cache first
    const cached = await pool.query('SELECT * FROM houses_cache WHERE date = $1 LIMIT 1', [today]);
    if (cached.rows.length > 0) return { date: today, houses: cached.rows[0].houses };

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) throw new Error('RAPIDAPI_KEY environment variable not set');

    console.log('Fetching live DMV listings from Zillow API (parallel)...');
    const results = await Promise.all(
        DMV_LOCATIONS.map(loc =>
            fetchListings(loc, apiKey).then(list => list.map(h => ({ ...h, _area: loc })))
        )
    );
    const allResults = results.flat();

    const seen = new Set();
    const unique = allResults.filter(h => { if (seen.has(h.id)) return false; seen.add(h.id); return true; });

    const deals = unique
        .filter(h => {
            const market = h.zestimate || h.taxAssessedValue;
            return market > 0 && h.unformattedPrice > 0 && h.unformattedPrice < market;
        })
        .map(h => {
            const market = h.zestimate || h.taxAssessedValue;
            const discountPct = Math.round((1 - h.unformattedPrice / market) * 100);
            return {
                id: h.id,
                address: h.address.street,
                city: `${h.address.city}, ${h.address.state} ${h.address.zipcode}`,
                state: h.address.state,
                area: h._area,
                type: formatHomeType(h.homeType),
                beds: h.beds, baths: h.baths,
                sqft: h.livingArea || h.area,
                listedPrice: h.unformattedPrice,
                marketPrice: market,
                savings: market - h.unformattedPrice,
                discountPct,
                imageUrl: h.imgSrc || null,
                detailUrl: h.detailUrl,
                daysOnMarket: h.daysOnZillow || 0
            };
        })
        .sort((a, b) => b.discountPct - a.discountPct)
        .slice(0, 50);

    console.log(`Found ${deals.length} below-market deals`);
    await pool.query('INSERT INTO houses_cache (date, houses) VALUES ($1, $2)', [today, JSON.stringify(deals)]);
    return { date: today, houses: deals };
}

app.get('/api/houses', async (req, res) => {
    try { res.json(await getDailyHouses()); }
    catch (e) { res.status(500).json({ error: e.message }); }
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

init().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
    scheduleMidnightRefresh();
    if (process.env.RAPIDAPI_KEY) getDailyHouses().catch(e => console.error('Houses pre-fetch failed:', e.message));
}).catch(e => {
    console.error('Failed to initialize database:', e.message);
    process.exit(1);
});
