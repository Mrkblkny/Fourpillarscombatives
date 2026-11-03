# Four Pillars Combatives — Website

Website: https://fourpillarscombatives.com  
Location: Pearl, Mississippi · Serving the Jackson Metro  
Email: info@fourpillarscombatives.com · Phone: 601-213-7419

## Pages and hosting

This repository contains a static website hosted through GitHub and Cloudflare Pages. The homepage is `index.html`; additional pages include `training.html`, `programs.html`, `lessons.html`, `seminars.html`, `about.html`, and `contact.html`. Shared front-end assets are in `assets/`.

Cloudflare Pages redirects a page such as `/contact.html` to the final URL `/contact`. Canonical tags and the sitemap use those final extensionless URLs.

## Current training information

- **Group classes:** Monday and Wednesday, **5:30–6:50 PM** (80 minutes), at a location confirmed before attendance.
- **Group memberships:** 12-month $65/month; 6-month $75/month; month-to-month $85/month.
- **Drop-in class:** $20; **four-class pass:** $70, expires after 60 days.
- **Additional household member discount:** $10/month off the corresponding group membership while both are active.
- **Private 1:1 lessons, 60 minutes:** $40 single; four lessons $150; eight $290; twelve $420 (as low as $35 per lesson).
- **Semi-private two-person lessons, 60 minutes:** $50 single; four $190; eight $360; twelve $510 (total for both people).
- **Small group, 60 minutes:** three people $65; four people $80 (total per session).
- **Personal training, 60 minutes:** $35 single; four $140; eight $280; twelve $420.
- **Live video, 60 minutes:** $25 per session.
- **Workshops, seminars and corporate retreats:** contact for pricing and availability.

Fees for noncash payments and applicable taxes are additional. Group memberships do not include private lessons. Written membership terms govern cancellation and renewals. Class dates and appointment availability must always be confirmed.

## Direct contact form — initial activation required

The contact page sends form submissions to `info@fourpillarscombatives.com` through **FormSubmit** (a third-party form processing service). This does not require a custom server. It uses the provider's default spam protection and a honeypot field. The page continues to offer phone and direct-email contact as alternatives.

**After publishing, you must activate the form once:**

1. Open https://fourpillarscombatives.com/contact and submit a **test inquiry** with your own contact information.
2. Check `info@fourpillarscombatives.com` (including Spam/Junk) for the **FormSubmit activation email** and select the confirmation link.
3. Submit a second test inquiry. Verify that it reaches the inbox. **Until the form is activated and tested, do not assume it delivers inquiries.**

FormSubmit processes and temporarily retains submitted contact details as a third party; review their terms and privacy policy before enabling on the live site. If you prefer not to use the third party, keep the current email-based form instead of uploading `contact.html` and `assets/site.js`, or configure your own Cloudflare Pages Function with a verified email service.

## Uploading website files

To apply a ZIP patch, unzip it first and upload **the files themselves** to the matching locations in your GitHub repo (root files to root, `assets/site.js` inside `assets/`). Choose **Commit changes**, then check Cloudflare Pages deployment status. Back up the current files first.

The change package dated Nov 3, 2026 intentionally **does not modify `index.html`, Google Analytics, any GA measurement IDs, or analytics settings**.
