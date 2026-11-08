# Four Pillars Combatives — Website

Website: https://fourpillarscombatives.com  
Location: Pearl, Mississippi · Serving the Jackson Metro  
Email: info@fourpillarscombatives.com · Phone: 601-213-7419

## Pages and hosting

This repository contains a static website hosted on Cloudflare Workers (Static Assets) and maintained through GitHub. The homepage is `index.html`; additional pages include `training.html`, `programs.html`, `lessons.html`, `seminars.html`, `about.html`, and `contact.html`. Shared front-end assets are in `assets/`.

The live Cloudflare setup supports extensionless routes, such as `/contact`, for pages in this repository. Canonical tags and the sitemap use those final extensionless URLs.

## Current training information

- **Group classes:** Monday and Wednesday, **5:30–6:50 PM** (80 minutes), at a location confirmed before attendance.
- **Group memberships:** 12-month $75/month; 6-month $85/month; month-to-month $95/month.
- **Drop-in class:** $30; **four-class pass:** $100, expires after 60 days.
- **Additional household member discount:** Up to $10/month on qualifying group memberships, subject to a $75/month minimum.
- **Private 1:1 lessons, 60 minutes:** $40 single; four lessons $150; eight $290; twelve $420 (as low as $35 per lesson).
- **Semi-private two-person lessons, 60 minutes:** $65 single; four $250; eight $490; twelve $720 (total for both people).
- **Small group, 60 minutes:** three people $90; four people $115 (total per session).
- **Personal training, 60 minutes:** $35 single; four $140; eight $280; twelve $420.
- **Live video, 60 minutes:** $25 per session.
- **Workshops, seminars and corporate retreats:** contact for pricing and availability.

Fees for noncash payments and applicable taxes are additional. Group memberships do not include private lessons. Written membership terms govern cancellation and renewals. Class dates and appointment availability must always be confirmed.

## Contact form and delivery verification

The live contact page uses **Formspree**, posting inquiries to the configured
`https://formspree.io/f/mljjagkr` endpoint. The form also offers direct
telephone and email alternatives. The site previously used a different form
provider; older FormSubmit activation instructions do not apply.

**Delivery verification:** The form's presence in HTML does not prove that
inquiries are reaching the inbox. The site owner or an authorized tester should
submit a clearly labeled test inquiry, confirm delivery to the intended address
in Formspree and the inbox, and review any relevant spam or notification settings.
Do not send test submissions to real third parties without authorization.

Review the provider's privacy practices and any spam protection settings.
Do not publish secret Formspree keys, private Supabase keys, or Stripe keys.

## Uploading website files

To apply a ZIP patch, unzip it first and upload **the files themselves** to the matching locations in your GitHub repo (root files to root, `assets/site.js` inside `assets/`). Choose **Commit changes**, then check Cloudflare Workers deployment status. Back up the current files first.

The change package dated Nov 3, 2026 intentionally **does not modify `index.html`, Google Analytics, any GA measurement IDs, or analytics settings**.
