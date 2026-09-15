# ATXFORGE Opportunity Desk

Production-quality **opportunity desk** for the ATXFORGE micro-agency / collective. Curates senior seats where ATXFORGE can **replace one full-time hire** (VP / Director / Co-founder / $100k+ scope) or land **flexible partnership / build** work — across **any industry**.

Stack: Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion. Dark ember aesthetic aligned with the ATXFORGE marketing site.

## Run locally

```bash
cd /workspace/atxforge-opportunity-desk
npm install
npm run dev          # http://localhost:3001
npm run build        # production build
npm start            # serve production on :3001
```

Port **3001** is intentional so `:3000` can host the marketing site.

Hash routes: `#all` · `#hire-replacement` · `#flexible` · `#build-creative` · `#poor-fit`

## Product tracks

1. **Hire Replacement** — Co-founder / VP / Director / Head / C-level / clear $100k+ where one senior seat can be covered by a multi-skill bench.
2. **Flexible Forge Fit** — Outcomes/growth over hours; async; set-your-own-hours. Rigid 9–5 / daily office / timezone theater → **poor-fit**.
3. **Build / Creative** — Needs real engineering, deploy, or creative asset pipelines (not vibe-only toys).

## Team skill mapping

| Partner | Lens |
|--------|------|
| **Peter** | Offer / mechanisms / language / CMO-shaped leadership |
| **Wilson** | Systems / integrations / vibe-coding → wiring |
| **Dev Shop** | Real production engineering |
| **Creative & Deploy** | Creative production, assets, launch execution |

## How to add an opportunity

1. Open `src/data/opportunities.ts`.
2. Append an object matching the `Opportunity` schema in `src/data/types.ts`.
3. Required fields: `id`, `title`, `org`, `tracks[]`, `seniority`, `salarySignal`, `flexibility`, `industry`, `skills[]`, `sourceName`, `sourceType`, `sourceUrl`, `community`, `contextExcerpt`, `whyForge`, `recommendedPartners`, `fitNotes`, `status`, `seenAt`, `sample`.
4. Optional: `screenshotPath` (e.g. `/screenshots/my-listing.png` under `public/`).
5. Leave `score` out of the raw entry — `computeForgeScore()` fills it. Or set explicitly if you override.
6. Set `sample: true` for research/seed rows. Never claim fake “we scraped Slack yesterday” for seeded data.
7. Rebuild / refresh the app.

Example skeleton:

```ts
{
  id: "opp-new-example",
  title: "Fractional VP Growth",
  org: "Acme",
  tracks: ["hire-replacement", "flexible"],
  seniority: "VP",
  salarySignal: "Fractional rate",
  flexibility: "Flexible",
  industry: "SaaS",
  skills: ["Peter", "Wilson"],
  sourceName: "Fractional Jobs",
  sourceType: "Job board",
  sourceUrl: "https://example.com/listing",
  community: "Fractional Jobs board",
  contextExcerpt: "Exact language that triggered the flag…",
  whyForge: "Hire-replacement angle + multi-skill coverage…",
  recommendedPartners: ["Peter", "Wilson"],
  fitNotes: "Risks / flexibility notes…",
  screenshotPath: "/screenshots/placeholder-dossier.svg",
  status: "New",
  seenAt: "2026-09-15",
  sample: true,
}
```

Watch sources live in `src/data/sources.ts`.

## Scoring

See **[SCORING.md](./SCORING.md)** and `src/lib/scoring.ts`. Boosts: senior titles, $100k+/fractional, flexible language, multi-partner overlap, build+creative needs. Penalties: rigid 9–5 / office daily, junior IC, vibe-only with no deploy path.

## Live-sourcing next steps (v2+)

No backend/auth in v1. Future ingest routines can append to the same schema:

- **Job boards** — Fractional Jobs, Wellfound, Remote OK, WWR, Contra, YC jobs (poll + normalize).
- **LinkedIn** — Manual triage of public founder posts; store `sourceUrl` deep links.
- **Slack / Discord** — Bot or export → dossier with `community`, `contextExcerpt`, `sourceUrl` to the thread. Label provenance honestly.
- **Screenshots** — Playwright/Puppeteer capture → `public/screenshots/{id}.png` + `screenshotPath`.
- **Persistence** — Status workflow is session-local today; move to DB or localStorage when ready.

## Brand

Ink / charcoal + ember orange (`#ff5c1a`), Syne + DM Sans + Geist Mono — same family as `/workspace/atxforge`.
