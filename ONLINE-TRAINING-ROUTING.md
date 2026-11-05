# Online training under the main domain

**Target address:** https://fourpillarscombatives.com/online-training/

This site and the online portal intentionally remain **two separate Cloudflare Pages projects**. No files need to be moved from one repository into the other.

**Draft only:** Do not merge the homepage link until the route works, student login and recovery are tested, and the training app has been deployed with the matching path changes.

## Setup in Cloudflare

1. Open Workers & Pages → the existing online-training Pages project → Custom domains.
2. Add **training-origin.fourpillarscombatives.com** as a mirror domain for the training Pages project. Wait until it says Active. Cloudflare should create the associated DNS record automatically. **Do not** change the main domain's current Pages custom domain.
3. Create a **new Worker** in Workers & Pages (for example `fpc-online-training-router`). Replace its initial source with `cloudflare/online-training-proxy.js` from this repository, and deploy.
4. Open that Worker → Settings → Domains & Routes → Add → Route. Choose the `fourpillarscombatives.com` zone. Enter the route exactly as `fourpillarscombatives.com/online-training*`. Do not attach this Worker to `fourpillarscombatives.com/*` or the root custom domain.
5. The Worker redirects `/online-training` to `/online-training/`; all subpaths, including `/online-training/api/*`, are proxied to the mirror. Query strings, method, body, and authorization headers are forwarded.
6. In the **training Pages** project's server environment variables, set `PUBLIC_TRAINING_URL=https://fourpillarscombatives.com/online-training/` after the route is ready, then redeploy the training project. This is not a secret and should have a trailing slash.
7. Add `https://fourpillarscombatives.com/online-training/**` to Supabase Authentication redirect allow-list without removing existing URLs.
8. Verify root page and assets, `/online-training/api/config`, sign-up, email verification, login/logout, password recovery, paid member access, lesson progress, and Stripe test checkout returning to the new public URL. Keep the existing Stripe webhook URL unless you intentionally migrate it and test its signing secret. Do not enable payments until the rest of the launch checklist is complete.
9. Once all tests pass, merge the companion draft pull request in the main website that updates only the Explore Online Training button.

## Safety and rollback

If the new route fails, remove **only** the `fourpillarscombatives.com/online-training*` Worker route. Your main website and original training `.pages.dev` URL remain on their own Cloudflare projects. Keep the original Pages URL and Supabase redirect allowed during transition. Revert the public homepage button to the original Pages address if it had already been switched.

Do not publish Supabase private keys, Stripe secret keys, or `.dev.vars` in GitHub.

This setup uses a Worker route rather than a Cloudflare Origin Rule because Host header / DNS origin override permissions depend on the Cloudflare plan. See: https://developers.cloudflare.com/workers/configuration/routing/routes/
