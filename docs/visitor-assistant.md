# Four Pillars Combatives — Visitor Training Assistant
Updated November 8, 2026

## What is included
- A compact, accessible assistant on the ten public marketing pages (not inside student, Community, or Admin applications).
- Approved, predictable answers for classes, pricing, private lessons, women’s self-defense, workshops, Online Training, fitness, Eskrima, instructor and location.
- Contextual links to the relevant public page or contact form, not promises to book appointments.
- A publicly readable homepage FAQ section, for both real visitors and standard search indexing.
- A Cloudflare Workers endpoint `POST /api/visitor-assistant` that uses the approved knowledge base; optional Workers AI can reword an approved answer without being trusted for unknown facts.
- Anonymous category-only Analytics Engine data (e.g. `private`, `classes`, `women`, `other`). No question text, email, member records or IP addresses are written to this dataset.
- An approximate rate-limit binding of 8 questions per 60 seconds per edge/IP; client UI prevents simultaneous submissions.
- No conversation history storage or automatic model training.

## AI activation: intentionally disabled by default
`ASSISTANT_AI_ENABLED` is not set by the repository and thus generative inference is **OFF**.
The guided assistant can answer public questions without model usage costs.

The Cloudflare Worker has an `AI` binding configured in `wrangler.toml`.
**Only if you knowingly choose to enable metered generative inference**, set the Cloudflare environment variable `ASSISTANT_AI_ENABLED=true` for the `fourpillarscombatives` Worker and redeploy as required. Verify Workers AI free allocations/current billing before doing so. Never add API keys in JavaScript or GitHub.

Workers AI model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. Responses are restricted to approved, relevant business facts as context, and failed requests fall back to reviewed text. The generated response is still AI content and should be reviewed for mistakes; prices and availability always require human confirmation.

The `/online-training/` Worker, Admin Dashboard, Stripe, Supabase accounts and paid access are untouched.

## Updating answers and getting insights
1. Update `assets/assistant-knowledge.js` when classes, prices, policies or programs change.
2. Run the GitHub `Audit website pages and navigation` workflow, including `tests/assistant-audit.mjs`.
3. Look at Cloudflare Analytics Engine data for dataset `fpc_visitor_questions`. `blob1` is the approved topic id, `double1` a count, and `timestamp` the event time. Question text is **not** available.
4. If a lot of questions fall into the `other` category, gather and *manually review* new FAQs from your business conversations without saving private user chat content. Add new answers to the knowledge base and to visible website copy.

The assistant does not automatically learn or retrain itself on user input.
Search engines may use readable, accurate service and FAQ pages, but no AI or Google ranking benefit is promised. Avoid publishing unsupported claims or spammy FAQ structured data.

## Testing
Run `node tests/assistant-audit.mjs` and `node tests/site-audit.mjs`.
After Cloudflare deployment, open the public homepage on an Android-sized browser and desktop:
- Ask "When are group classes?" and confirm the Monday/Wednesday 5:30–6:50 PM reply and classes link.
- Ask about women's self-defense and confirm it is offered by request, not advertised as a weekly women-only class.
- Ask about kids' classes or an unknown topic; it must direct you to the instructor, not invent a program.
- Verify keyboard escape closes the widget, no horizontal overflow, the ordinary public menu still works, and no member/admin login data is used.
- Confirm `POST /api/visitor-assistant` is functional. The public widget has local guided answers as a safe fallback before the backend deploy.

## Security notes
Keep `worker/index.js` out of the publicly served assets via `.assetsignore`. Restrict the Worker script to the assistant API route using `assets.run_worker_first`. The knowledge base itself is public, but sensitive staff or student information must never be entered there.
Review Cloudflare AI usage and question-category volumes periodically; disable AI inference by removing its environment variable if costs or performance are not acceptable.
