# Four Pillars Combatives — Complete Website Audit
**Audit date:** November 8, 2026  
**Sites:** https://fourpillarscombatives.com/ and https://fourpillarscombatives.com/online-training/

## Executive findings
1. **Fixed: Community admin tools appeared on the members' menu.** The member-facing Community Hub contained a real `ADMINISTRATION` heading and a hidden `Community Moderation` button; the heading remained visible, including with restricted permissions. Admin moderation was also offered as a Community Home quick link to admins. Both are now **completely removed from the Community menu and quick links** (desktop and mobile). The admin screen still exists strictly within the verified Admin Dashboard iframe. A clearly labeled **Admin Dashboard → Community → Open Community Moderation** action now returns the owner to that screen. Admin login remains footer-only, not a member menu item. The server continues to enforce administrator authorization.
2. **Fixed: stale curriculum message.** Online Training described its fifth curriculum section as `Lessons coming soon during public beta.` despite an already live library. It now says **`New lessons and PDF handouts are being added during public beta.`** The platform still explicitly identifies itself as **PUBLIC BETA**.
3. **Current unified Account and Admin improvements were checked.** Member Dashboard has one My Account profile area and one Save Changes action for private first/last name and permitted public community profile/privacy fields. Photo uploads are not offered as a profile control; discussion photo attachments remain permission-gated. Admin → Overview has Needs Attention for reports, private student help requests and pending video feedback.
4. **Main website static inspection passed.** All 10 main routes have expected page titles, SEO descriptions and canonicals, skip links, internal routes/assets, navigation, Facebook link and updated five-section curriculum; automated tests check duplicate IDs, in-page anchors and service descriptions.
5. **Browser and live integrity testing added.** The read-only Chromium browser audit checks public mobile and desktop layout, horizontal overflow, uncaught page errors, navigation interactions, Community member-menu isolation, and protected Admin entry. The latest audit source tests widths of **320px, 390px, 768px and 1365px**. It covers all 10 public website pages plus Training, Community and Admin routes. Workflow: [Live Mobile + Desktop Browser Audit](https://github.com/Mrkblkny/Fourpillarscombatives/actions/workflows/browser-audit.yml).
6. **Online training test suite:** all **257** training platform static/integration/unit tests passed in the merged PR [#71](https://github.com/Mrkblkny/Four-Pillars-Online-Training-/pull/71). Live site audit rerun [#42512309587](https://github.com/Mrkblkny/Fourpillarscombatives/actions/runs/42512309587) passed after deployment propagation. It checks real deployed content, routes, permission-gated features, and anonymous API denials.

## Sites and features checked
| Area | Audit areas |
|---|---|
| Main marketing site (10 pages) | Home, About, Group Classes & Pricing, All Programs, Curriculum, Private Lessons, Women's Self-Defense, Seminars, Personal Training, Contact; internal links, navigation, SEO, mobile responsiveness and contact markup |
| Online Training | Public beta and access descriptions; five-section curriculum, price/privacy copy, free sign-up entry, mobile navigation, lesson/project UI, one Account Save Changes |
| Community Hub | Server-derived Free / admin-assigned Member / Founding / VIP feature availability; one Account profile; no member-visible moderation menu; mobile picker; safe discussion photo controls |
| Admin Dashboard | Verified administrator login boundary; moderation iframe and shortcut; Needs Attention, reports, video inbox, permissions, lessons and student management; no anonymous admin access |
| Hosting / API | Main website proxy and training Cloudflare Pages deployment checks, protected endpoints, deployed HTML and same-origin Community iframe response headers |

## Server and security audit
The production Supabase advisor reported **0 health findings**. Its security advisor reported **one outstanding password warning**: leaked-password protection is disabled, and requires an explicit Supabase dashboard / plan-eligibility review. See [Supabase Auth password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). The **RLS-enabled-without-policies** informational notices are expected for the existing server-only tables (browser roles have no direct grants). The performance advisor flagged 10 currently unused indexes, **not** evidence that the indexes should be dropped.

No database migrations, live payments, membership purchases, prices, tax settings, lesson progress or user records were changed during this menu/copy audit.

## Limits: do not overstate verification
- The browser audit is **unauthenticated and browser-emulated**; it is not testing actual iPhone or Android hardware. The real five-role authenticated mobile Playwright workflow has been prepared in [signed-in-mobile-qa.md](https://github.com/Mrkblkny/Four-Pillars-Online-Training-/blob/main/docs/signed-in-mobile-qa.md), but still requires permitted Free, Member, Founding, VIP and Admin QA accounts and has **not been executed**.
- No live Stripe checkout, signed webhook or refunds were triggered; those require a sandbox exercise with approved current offer prices.
- No live Contact form submission was made, so mail delivery was not proven. Its fields, markup and client submission/error-handling code are covered by source checks.
- Responsive overflow checks, browser console/page errors, URLs and markup are automated; they are **not** a human visual review of every signed-in state or a guarantee that every possible typo is absent.
- Cloudflare changes may be briefly stale during deployment; rely on **completed live verification**, not simply a green source build.

## Prioritized follow-ups
First complete read-only authenticated mobile journeys for every membership level and admin, then exercise Account saves, privacy opt-ins, support requests, video feedback and moderation with explicitly authorized **TEST** accounts. Test any charge/refund/webhook only in Stripe Sandbox. Review the Supabase leaked-password protection setting and verify real contact form delivery with a carefully labeled test inquiry.

**Relevant merged changes:** Training [#71](https://github.com/Mrkblkny/Four-Pillars-Online-Training-/pull/71); Main-site QA [#14](https://github.com/Mrkblkny/Fourpillarscombatives/pull/14) and runner compatibility [#15](https://github.com/Mrkblkny/Fourpillarscombatives/pull/15).


## Follow-up implementation — November 8, 2026 (main website and member UX)

### Main website implementation
- Updated homepage primary choices to **Request a Free Intro Lesson** and **Explore Online Training**. Seminar booking still appears in main navigation and its own service page.
- Updated asset-version query strings for all ten marketing HTML pages and visitor assistant imports to `20261109-ux-audit`. This prevents old cached menu and assistant JS/CSS from persisting after the main Worker is actually deployed.
- Added `.github/workflows/deploy-main-site.yml`, a source-validated Wrangler deployment of the **existing** `fourpillarscombatives` Worker only. This does not edit the separate `/online-training/*` routing Worker or its Pages deployment.
- **Unresolved production blocker:** the first deploy workflow run [42538950588](https://github.com/Mrkblkny/Fourpillarscombatives/actions/runs/42538950588) failed at the *private Cloudflare credentials* step, **before deployment**. One or both required GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` must be configured in the repository settings. Use a token scoped to the existing Worker. Do not paste either secret into a chat or commit them in source code.
- As a result the main website's latest live [browser audit run 42538950603](https://github.com/Mrkblkny/Fourpillarscombatives/actions/runs/42538950603) remains failing due to stale deployed menu/assistant assets. Source checks pass. **Do not claim the live menu or idle assistant are fixed until deployment succeeds and the browser audit passes**.

### Portal, Community Hub, and Admin Dashboard implementation
- Member Dashboard: **Continue Training / next lesson appears first** in the page and mobile reading order, with the profile overview second. The loading banner and repeating mobile logo were previously compacted.
- Member Dashboard: independent Community permission information, instructor updates, and support-request history now load concurrently. Server-side entitlement checks and individual error handling remain in place.
- Community Hub: Home shortcuts lead with **Browse discussions**, then **Explore groups** when enabled. My Account stays available; disabled features are never offered.
- Admin Dashboard: **Manage students** is the first overview shortcut, ahead of lesson organization, member preview, and announcements. It retains the existing per-student access summaries and safe edit flow.
- Added/updated unit and browser regression checks for the member layout, Community shortcuts and concurrent member loading. Production-readiness now verifies the `data-layout="next-lesson-first"` marker and the Admin `Manage students` label in deployed HTML.
- No changes were made to any customer's membership, permissions, purchases, payments, lesson progress, database tables, or Stripe settings.

### Remaining verification
1. Configure private Cloudflare CI credentials and run the main Worker deployment workflow; rerun the public mobile/desktop browser audit to confirm all six previously failing checks pass.
2. Confirm the training portal's **latest** build tests and Cloudflare readiness run after its final code changes, rather than relying on earlier commit checks.
3. Use authorized **TEST** student and admin accounts for signed-in browser journeys (Free, Member, Founding, VIP, Admin). No five-account live authenticated run has been completed.
4. Verify real contact-form email delivery separately, without generating unsolicited messages.
5. Review Supabase leaked-password protection in Auth settings. Production health advisor reports no findings; intentional server-only RLS/no-policy informational lints should not be fixed by granting broad browser access.
