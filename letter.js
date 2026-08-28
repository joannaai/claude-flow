// Standalone Tenant Notices site (letter.html). This intentionally duplicates the
// Letter-tab logic from script.js rather than sharing it, so this page has zero
// dependency on the main blog's markup/behavior and can be served as its own site
// (e.g. at a dedicated domain) with no nav to the blog/games/houses sections.

function setupTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    const isDark = localStorage.getItem("darkMode") === "true";

    if (isDark) {
        document.body.classList.add("dark-mode");
    }

    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isNowDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isNowDark);
    });
}

function setupLocalNavigation() {
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            const section = tab.dataset.section;

            document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
            document.getElementById(section).classList.add("active");

            if (section === "letter-history") {
                loadLetterHistory();
            }
        });
    });
}

function escapeLetterHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function buildMdNoticeHtml(d) {
    const totalDue = (parseFloat(d.rentAmount) || 0) + (parseFloat(d.lateFeeAmount) || 0);
    const fmt = n => "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `
        <div style="line-height:1.6; font-size:0.92rem;">
            <h3 style="text-align:center; margin-bottom:0.2rem;">NOTICE OF INTENT TO FILE A COMPLAINT FOR SUMMARY EJECTMENT (Failure to Pay Rent)</h3>
            <p style="text-align:center; margin-bottom:1.2rem;">(Real Property Article §8-401(c))</p>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div>
                    <strong>FROM: Landlord/Agent</strong>
                    <p style="margin:0.2rem 0;">${d.landlordName}<br>${d.landlordAddress}<br>${d.landlordCityStateZip}<br>Tel: ${d.landlordPhone}${d.landlordEmail ? "<br>Email: " + d.landlordEmail : ""}</p>
                </div>
                <div>
                    <strong>TO: Tenant(s)</strong>
                    <p style="margin:0.2rem 0;">${d.tenant1}${d.tenant2 ? ", " + d.tenant2 : ""}<br>${d.tenantAddress}<br>${d.tenantCityStateZip}${d.tenantPhone ? "<br>Tel: " + d.tenantPhone : ""}${d.tenantEmail ? "<br>Email: " + d.tenantEmail : ""}</p>
                </div>
            </div>

            <p style="text-align:center;"><strong>THIS IS NOT A NOTICE OF EVICTION</strong></p>
            <p>An action for repossession of the property may be initiated if the total amount listed below is not paid within 10 days after the landlord provides this notice. You have a legal right to dispute the charges.</p>

            <table style="width:100%; border-collapse:collapse; margin:1rem 0;">
                <tr><td style="border:1px solid #999; padding:0.5rem;">${fmt(d.rentAmount)} rent for the ${d.rentPeriod}</td><td style="border:1px solid #999; padding:0.5rem;">${d.rentFrom} to ${d.rentTo}</td></tr>
                ${d.lateFeeAmount ? `<tr><td style="border:1px solid #999; padding:0.5rem;">${fmt(d.lateFeeAmount)} late fee for the ${d.lateFeePeriod}</td><td style="border:1px solid #999; padding:0.5rem;">${d.lateFeeFrom} to ${d.lateFeeTo}</td></tr>` : ""}
                <tr><td style="border:1px solid #999; padding:0.5rem;"><strong>TOTAL</strong></td><td style="border:1px solid #999; padding:0.5rem;"><strong>${fmt(totalDue)}</strong></td></tr>
            </table>
            <p style="font-size:0.85rem;">*Due pursuant to the terms of your lease. *Does not include other charges related to utilities, services, other fees, fines, and court costs.</p>
            <p style="font-size:0.85rem;">At your request, the landlord must promptly provide you an itemized accounting of debits and credits (rental ledger) showing how the amount you owe came to be.</p>

            <p><strong>DATE AND METHOD OF PROVIDING NOTICE</strong></p>
            <p>This notice is being provided to the tenant by the landlord on ${d.noticeDate} by: ${d.deliveryMethod}</p>

            <div style="display:flex; justify-content:space-between; margin:1.5rem 0;">
                <span>Date: ${d.noticeDate}</span>
                <span>Signature: ______________________</span>
            </div>

            <div style="border:1px solid #999; padding:1rem; margin-top:1.5rem; font-size:0.85rem;">
                <strong>RESOURCES FOR TENANTS AND LANDLORDS</strong>
                <ul style="margin:0.5rem 0 0 1.2rem;">
                    <li>Under the Access to Counsel in Evictions Law, all income qualified tenants will have access to an attorney. Call 211 for a referral or visit legalhelp.org for more information.</li>
                    <li>Alternative Dispute Resolution (ADR) Office: mdcourts.gov/district/adr/home — Mediation is a conversation between the landlord and tenant facilitated by a mediator, available before and after a failure-to-pay-rent case is filed in the District Court of Maryland.</li>
                    <li>Rental assistance may be available to both Tenants and Landlords. Visit mdcourts.gov/legalhelp/housing.</li>
                    <li>Speak with a lawyer for free at a Maryland Court Help Center. Visit mdcourts.gov/helpcenter or call 410-260-1392.</li>
                </ul>
            </div>
            <p style="text-align:right; font-size:0.75rem; color:#888; margin-top:1rem;">DC-CV-115 (Rev. 10/2024)</p>
        </div>
    `;
}

function buildVaNoticeHtml(d) {
    const fmt = n => "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `
        <div style="line-height:1.6; font-size:0.92rem;">
            <h3 style="text-align:center; margin-bottom:0.2rem;">14-DAY NOTICE TO PAY RENT OR QUIT</h3>
            <p style="text-align:center; margin-bottom:1.2rem;">(Nonpayment of Rent — Va. Code § 55.1-1245)</p>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div>
                    <strong>FROM: Landlord/Agent</strong>
                    <p style="margin:0.2rem 0;">${d.landlordName}<br>${d.landlordAddress}<br>${d.landlordCityStateZip}<br>Tel: ${d.landlordPhone}${d.landlordEmail ? "<br>Email: " + d.landlordEmail : ""}</p>
                </div>
                <div>
                    <strong>TO: Tenant(s)</strong>
                    <p style="margin:0.2rem 0;">${d.tenant1}${d.tenant2 ? ", " + d.tenant2 : ""}<br>${d.tenantAddress}<br>${d.tenantCityStateZip}${d.tenantPhone ? "<br>Tel: " + d.tenantPhone : ""}${d.tenantEmail ? "<br>Email: " + d.tenantEmail : ""}</p>
                </div>
            </div>

            <p>You are hereby notified that you have failed to pay rent as required under your rental agreement. The rent set forth below remains unpaid:</p>

            <table style="width:100%; border-collapse:collapse; margin:1rem 0;">
                <tr><td style="border:1px solid #999; padding:0.5rem;">${fmt(d.rentAmount)} rent for the ${d.rentPeriod}</td><td style="border:1px solid #999; padding:0.5rem;">${d.rentFrom} to ${d.rentTo}</td></tr>
                <tr><td style="border:1px solid #999; padding:0.5rem;"><strong>TOTAL DUE</strong></td><td style="border:1px solid #999; padding:0.5rem;"><strong>${fmt(d.rentAmount)}</strong></td></tr>
            </table>

            <p><strong>You have FOURTEEN (14) DAYS from the date of this notice to pay the total amount due.</strong> If the rent is not paid in full within this 14-day period, the landlord intends to terminate the rental agreement and may file an unlawful detainer action in the <strong>Prince William County General District Court</strong> to obtain possession of the premises. This notice is provided pursuant to Va. Code § 55.1-1245.</p>

            <p><strong>DATE AND METHOD OF PROVIDING NOTICE</strong></p>
            <p>This notice is being provided to the tenant by the landlord on ${d.noticeDate} by ${d.deliveryMethod}.</p>

            <div style="display:flex; justify-content:space-between; margin:1.5rem 0;">
                <span>Date: ${d.noticeDate}</span>
                <span>Signature: ______________________</span>
            </div>

            <p style="font-size:0.8rem; color:#888; border:1px solid #999; padding:0.75rem;">This is a template based on current Virginia statutory requirements and is not a substitute for advice from a Virginia-licensed attorney. Notice periods and required content can change; verify current requirements before relying on this notice in a legal proceeding.</p>
        </div>
    `;
}

function setupLetterForm() {
    const stateSelect = document.getElementById("letter-state-select");
    const generalForm = document.getElementById("letter-form-general");
    const mdForm = document.getElementById("letter-form-md");
    const vaForm = document.getElementById("letter-form-va");
    const previewWrapper = document.getElementById("letter-preview-wrapper");
    const preview = document.getElementById("letter-preview");
    const printBtn = document.getElementById("letter-print-btn");
    const copyBtn = document.getElementById("letter-copy-btn");
    const pdfBtn = document.getElementById("letter-pdf-btn");
    const emailBtn = document.getElementById("letter-email-btn");

    let lastLetterType = null; // "general" | "md-cv115" | "va-pay-or-quit"
    let lastLetter = null; // raw (unescaped) field values, used for PDF export

    // Default the notice date and rent-owed-through date to today
    const todayLocal = new Date();
    const yyyy = todayLocal.getFullYear();
    const mm = String(todayLocal.getMonth() + 1).padStart(2, "0");
    const dd = String(todayLocal.getDate()).padStart(2, "0");
    const todayIso = `${yyyy}-${mm}-${dd}`;
    document.getElementById("md-notice-date").value = todayIso;
    document.getElementById("md-rent-to").value = todayIso;
    document.getElementById("md-latefee-to").value = todayIso;
    document.getElementById("va-notice-date").value = todayIso;
    document.getElementById("va-rent-to").value = todayIso;

    const FORMS_BY_STATE = { general: generalForm, MD: mdForm, VA: vaForm };

    stateSelect.addEventListener("change", () => {
        Object.entries(FORMS_BY_STATE).forEach(([state, form]) => {
            form.style.display = state === stateSelect.value ? "flex" : "none";
        });
        // Email sending isn't wired up for the general letter type
        emailBtn.style.display = stateSelect.value === "general" ? "none" : "inline-block";
        previewWrapper.style.display = "none";
    });

    generalForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const recipientRaw = document.getElementById("letter-recipient").value;
        const addressRaw = document.getElementById("letter-address").value;
        const reasonRaw = document.getElementById("letter-reason").value;
        const period = document.getElementById("letter-period").value;
        const detailsRaw = document.getElementById("letter-details").value;
        const senderRaw = document.getElementById("letter-sender").value;

        const periodLabel = period
            ? (() => {
                const [py, pm] = period.split("-").map(Number);
                return new Date(py, pm - 1, 1).toLocaleDateString(undefined, { year: "numeric", month: "long" });
            })()
            : "";
        const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

        lastLetterType = "general";
        lastLetter = { recipient: recipientRaw, address: addressRaw, reason: reasonRaw, periodLabel, details: detailsRaw, sender: senderRaw, today };

        const recipient = escapeLetterHtml(recipientRaw);
        const address = escapeLetterHtml(addressRaw);
        const reason = escapeLetterHtml(reasonRaw);
        const details = escapeLetterHtml(detailsRaw);
        const sender = escapeLetterHtml(senderRaw);

        preview.innerHTML = `
            <div style="line-height:1.8;">
                <p>${today}</p>
                <p>${recipient}<br>${address}</p>
                <p><strong>Re: Warning Notice — ${reason}${periodLabel ? " (" + periodLabel + ")" : ""}</strong></p>
                <p>Dear ${recipient},</p>
                <p>This letter serves as formal notice regarding <strong>${reason.toLowerCase()}</strong> for the period of ${periodLabel}.</p>
                <p>${details.replace(/\n/g, "<br>")}</p>
                <p>Please address this matter promptly. Failure to do so may result in further action as outlined in your lease agreement.</p>
                <p>Sincerely,<br>${sender}</p>
            </div>
        `;
        previewWrapper.style.display = "block";
        previewWrapper.scrollIntoView({ behavior: "smooth" });
    });

    mdForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Rent-owed-from date = the 1st of the month, N months before today
        const rentCountNum = parseInt(document.getElementById("md-rent-count").value, 10) || 0;
        const rentFromDate = new Date();
        rentFromDate.setDate(1); // set day first to avoid day-overflow when shifting months
        rentFromDate.setMonth(rentFromDate.getMonth() - rentCountNum);
        const rfYyyy = rentFromDate.getFullYear();
        const rfMm = String(rentFromDate.getMonth() + 1).padStart(2, "0");
        document.getElementById("md-rent-from").value = `${rfYyyy}-${rfMm}-01`;

        // Late-fee months owed always mirrors the past-due rent months, so its
        // from-date uses the same "1st of the month, N months back" calculation
        document.getElementById("md-latefee-count").value = document.getElementById("md-rent-count").value;
        document.getElementById("md-latefee-from").value = `${rfYyyy}-${rfMm}-01`;

        const val = id => document.getElementById(id).value;
        const d = {
            landlordName: val("md-landlord-name"),
            landlordAddress: val("md-landlord-address"),
            landlordCityStateZip: val("md-landlord-citystatezip"),
            landlordPhone: val("md-landlord-phone"),
            landlordEmail: val("md-landlord-email"),
            tenant1: val("md-tenant1"),
            tenant2: val("md-tenant2"),
            tenantAddress: val("md-tenant-address"),
            tenantCityStateZip: val("md-tenant-citystatezip"),
            tenantPhone: val("md-tenant-phone"),
            tenantEmail: val("md-tenant-email"),
            rentAmount: val("md-rent-amount"),
            rentCount: val("md-rent-count"),
            rentUnit: val("md-rent-unit"),
            rentFrom: val("md-rent-from"),
            rentTo: val("md-rent-to"),
            lateFeeAmount: val("md-latefee-amount"),
            lateFeeCount: val("md-latefee-count"),
            lateFeeUnit: val("md-latefee-unit"),
            lateFeeFrom: val("md-latefee-from"),
            lateFeeTo: val("md-latefee-to"),
            noticeDate: val("md-notice-date"),
            deliveryMethod: val("md-delivery-method"),
        };
        d.rentPeriod = `${d.rentCount} ${d.rentUnit}`;
        d.lateFeePeriod = d.lateFeeCount ? `${d.lateFeeCount} ${d.lateFeeUnit}` : "";

        lastLetterType = "md-cv115";
        lastLetter = d;

        // Escape all user-entered text fields before rendering as HTML
        const escaped = {};
        Object.keys(d).forEach(k => { escaped[k] = escapeLetterHtml(String(d[k] ?? "")); });

        preview.innerHTML = buildMdNoticeHtml(escaped);
        previewWrapper.style.display = "block";
        previewWrapper.scrollIntoView({ behavior: "smooth" });
    });

    vaForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Rent-owed-from date = the 1st of the month, N months before today
        const rentCountNum = parseInt(document.getElementById("va-rent-count").value, 10) || 0;
        const rentFromDate = new Date();
        rentFromDate.setDate(1);
        rentFromDate.setMonth(rentFromDate.getMonth() - rentCountNum);
        const rfYyyy = rentFromDate.getFullYear();
        const rfMm = String(rentFromDate.getMonth() + 1).padStart(2, "0");
        document.getElementById("va-rent-from").value = `${rfYyyy}-${rfMm}-01`;

        const val = id => document.getElementById(id).value;
        const d = {
            landlordName: val("va-landlord-name"),
            landlordAddress: val("va-landlord-address"),
            landlordCityStateZip: val("va-landlord-citystatezip"),
            landlordPhone: val("va-landlord-phone"),
            landlordEmail: val("va-landlord-email"),
            tenant1: val("va-tenant1"),
            tenant2: val("va-tenant2"),
            tenantAddress: val("va-tenant-address"),
            tenantCityStateZip: val("va-tenant-citystatezip"),
            tenantPhone: val("va-tenant-phone"),
            tenantEmail: val("va-tenant-email"),
            rentAmount: val("va-rent-amount"),
            rentCount: val("va-rent-count"),
            rentFrom: val("va-rent-from"),
            rentTo: val("va-rent-to"),
            noticeDate: val("va-notice-date"),
            deliveryMethod: val("va-delivery-method"),
        };
        d.rentPeriod = `${d.rentCount} month${d.rentCount == 1 ? "" : "s"}`;

        lastLetterType = "va-pay-or-quit";
        lastLetter = d;

        const escaped = {};
        Object.keys(d).forEach(k => { escaped[k] = escapeLetterHtml(String(d[k] ?? "")); });

        preview.innerHTML = buildVaNoticeHtml(escaped);
        previewWrapper.style.display = "block";
        previewWrapper.scrollIntoView({ behavior: "smooth" });
    });

    printBtn.addEventListener("click", () => {
        window.print();
    });

    copyBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(preview.innerText);
            alert("Letter copied to clipboard.");
        } catch (err) {
            alert("Could not copy — please select and copy manually.");
        }
    });

    pdfBtn.addEventListener("click", async () => {
        if (!lastLetter) { alert("Generate the letter first."); return; }

        if (lastLetterType === "general") {
            if (!window.jspdf) { alert("PDF library failed to load — check your internet connection."); return; }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: "pt", format: "letter" });
            doc.setFont("times", "normal");
            doc.setFontSize(12);

            const marginX = 60;
            const maxWidth = 612 - marginX * 2;
            const lineHeight = 18;
            let y = 60;

            const writeLine = (text, bold = false) => {
                doc.setFont("times", bold ? "bold" : "normal");
                const lines = doc.splitTextToSize(text, maxWidth);
                lines.forEach(line => {
                    if (y > 740) { doc.addPage(); y = 60; }
                    doc.text(line, marginX, y);
                    y += lineHeight;
                });
            };

            const { recipient, address, reason, periodLabel, details, sender, today } = lastLetter;
            const periodSuffix = periodLabel ? ` (${periodLabel})` : "";

            writeLine(today); y += lineHeight / 2;
            writeLine(recipient);
            writeLine(address); y += lineHeight / 2;
            writeLine(`Re: Warning Notice — ${reason}${periodSuffix}`, true); y += lineHeight / 2;
            writeLine(`Dear ${recipient},`); y += lineHeight / 2;
            writeLine(`This letter serves as formal notice regarding ${reason.toLowerCase()} for the period of ${periodLabel}.`); y += lineHeight / 2;
            writeLine(details); y += lineHeight / 2;
            writeLine("Please address this matter promptly. Failure to do so may result in further action as outlined in your lease agreement."); y += lineHeight / 2;
            writeLine("Sincerely,");
            writeLine(sender);

            const safeName = ("warning-letter-" + (recipient || "letter")).replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "letter";
            doc.save(`${safeName}.pdf`);
            return;
        }

        if (lastLetterType === "va-pay-or-quit") {
            if (!window.jspdf) { alert("PDF library failed to load — check your internet connection."); return; }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: "pt", format: "letter" });
            doc.setFont("times", "normal");
            doc.setFontSize(11);

            const marginX = 54;
            const maxWidth = 612 - marginX * 2;
            let y = 50;
            const fmt = n => "$" + Number(n || 0).toFixed(2);

            const writeLine = (text, opts = {}) => {
                doc.setFont("times", opts.bold ? "bold" : "normal");
                doc.setFontSize(opts.size || 11);
                const lines = doc.splitTextToSize(text, opts.width || maxWidth);
                lines.forEach(line => {
                    if (y > 740) { doc.addPage(); y = 50; }
                    const x = opts.center ? 306 - doc.getTextWidth(line) / 2 : marginX;
                    doc.text(line, x, y);
                    y += opts.lineHeight || 15;
                });
            };

            writeLine("14-DAY NOTICE TO PAY RENT OR QUIT", { bold: true, size: 13, center: true });
            writeLine("(Nonpayment of Rent — Va. Code § 55.1-1245)", { size: 9, center: true });
            y += 8;

            writeLine("FROM: Landlord/Agent", { bold: true });
            writeLine(lastLetter.landlordName);
            writeLine(lastLetter.landlordAddress);
            writeLine(lastLetter.landlordCityStateZip + (lastLetter.landlordPhone ? "   Tel: " + lastLetter.landlordPhone : ""));
            if (lastLetter.landlordEmail) writeLine("Email: " + lastLetter.landlordEmail);
            y += 6;

            writeLine("TO: Tenant(s)", { bold: true });
            writeLine(lastLetter.tenant1 + (lastLetter.tenant2 ? ", " + lastLetter.tenant2 : ""));
            writeLine(lastLetter.tenantAddress);
            writeLine(lastLetter.tenantCityStateZip + (lastLetter.tenantPhone ? "   Tel: " + lastLetter.tenantPhone : ""));
            if (lastLetter.tenantEmail) writeLine("Email: " + lastLetter.tenantEmail);
            y += 10;

            writeLine("You are hereby notified that you have failed to pay rent as required under your rental agreement. The rent set forth below remains unpaid:");
            y += 4;
            writeLine(`${fmt(lastLetter.rentAmount)} rent for the ${lastLetter.rentPeriod}   ${lastLetter.rentFrom} to ${lastLetter.rentTo}`);
            writeLine(`TOTAL DUE: ${fmt(lastLetter.rentAmount)}`, { bold: true });
            y += 8;

            writeLine("You have FOURTEEN (14) DAYS from the date of this notice to pay the total amount due. If the rent is not paid in full within this 14-day period, the landlord intends to terminate the rental agreement and may file an unlawful detainer action in the Prince William County General District Court to obtain possession of the premises. This notice is provided pursuant to Va. Code § 55.1-1245.", { bold: true });
            y += 8;

            writeLine("DATE AND METHOD OF PROVIDING NOTICE", { bold: true });
            writeLine(`This notice is being provided to the tenant by the landlord on ${lastLetter.noticeDate} by ${lastLetter.deliveryMethod}.`);
            y += 10;
            writeLine(`Date: ${lastLetter.noticeDate}                                    Signature: ______________________`);
            y += 14;

            writeLine("This is a template based on current Virginia statutory requirements and is not a substitute for advice from a Virginia-licensed attorney. Verify current requirements before relying on this notice in a legal proceeding.", { size: 8 });

            const safeName = ("va-pay-or-quit-" + (lastLetter.tenant1 || "tenant")).replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "notice";
            doc.save(`${safeName}.pdf`);
            return;
        }

        try {
            const response = await fetch('/api/letter/md-notice-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lastLetter)
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Server error');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'md-notice-of-intent.pdf';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Could not generate PDF: ' + err.message);
        }
    });

    emailBtn.addEventListener("click", async () => {
        if (!lastLetter) { alert("Generate the notice first."); return; }
        if (!lastLetter.tenantEmail) { alert("Enter a tenant email address before sending."); return; }

        if (!confirm(`Send this notice by email to ${lastLetter.tenantEmail}?`)) return;

        emailBtn.disabled = true;
        const originalText = emailBtn.textContent;
        emailBtn.textContent = "Sending…";
        try {
            const endpoint = lastLetterType === "va-pay-or-quit" ? '/api/letter/va-notice-send' : '/api/letter/md-notice-send';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lastLetter)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server error');
            alert(`Notice emailed to ${data.sentTo}.`);
        } catch (err) {
            alert('Could not send email: ' + err.message);
        } finally {
            emailBtn.disabled = false;
            emailBtn.textContent = originalText;
        }
    });
}

const LETTER_TYPE_LABELS = {
    "md-cv115": "MD — Prince George's County",
    "va-pay-or-quit": "VA — Prince William County",
    general: "General Warning Letter",
};

async function loadLetterHistory() {
    const container = document.getElementById("letter-history-list");
    container.innerHTML = `<p style="color: var(--text-tertiary); text-align:center; padding:2rem;">Loading…</p>`;

    try {
        const response = await fetch('/api/letter/history');
        if (!response.ok) throw new Error((await response.json()).error || 'Server error');
        const rows = await response.json();

        if (!rows.length) {
            container.innerHTML = `<p style="color: var(--text-tertiary); text-align:center; padding:2rem;">No notices sent yet. Sent notices will show up here.</p>`;
            return;
        }

        const fmtDate = iso => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
        const fmtAmount = n => n === null || n === undefined ? "—" : "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        container.innerHTML = `
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="text-align:left; border-bottom:2px solid var(--border-color, #999);">
                            <th style="padding:0.6rem 0.5rem;">Date</th>
                            <th style="padding:0.6rem 0.5rem;">Notice Type</th>
                            <th style="padding:0.6rem 0.5rem;">Tenant</th>
                            <th style="padding:0.6rem 0.5rem;">Tenant Email</th>
                            <th style="padding:0.6rem 0.5rem;">Rent Amount</th>
                            <th style="padding:0.6rem 0.5rem;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => `
                            <tr style="border-bottom:1px solid var(--border-color, #ddd);">
                                <td style="padding:0.6rem 0.5rem; white-space:nowrap;">${escapeLetterHtml(fmtDate(r.created_at))}</td>
                                <td style="padding:0.6rem 0.5rem;">${escapeLetterHtml(LETTER_TYPE_LABELS[r.letter_type] || r.letter_type)}</td>
                                <td style="padding:0.6rem 0.5rem;">${escapeLetterHtml(r.tenant_name || "—")}</td>
                                <td style="padding:0.6rem 0.5rem;">${escapeLetterHtml(r.tenant_email || "—")}</td>
                                <td style="padding:0.6rem 0.5rem;">${fmtAmount(r.rent_amount)}</td>
                                <td style="padding:0.6rem 0.5rem; text-transform:capitalize;">${escapeLetterHtml(r.action)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<p style="color:#c0392b; text-align:center; padding:2rem;">Could not load letter history: ${escapeLetterHtml(err.message)}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupTheme();
    setupLocalNavigation();
    setupLetterForm();
});
