# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ATXFORGE Opportunity Desk: a single-page Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion app that curates senior roles (VP / Director / Co-founder / $100k+ / fractional) a multi-partner micro-agency could cover instead of one full-time hire. v1 has no backend, no auth, no API routes: all data is static TypeScript seed data.

## Commands

This is a Next.js project with npm scripts; no lockfile is committed, so `bun install` works fine (global preference is Bun).

```bash
bun install
bun run dev      # next dev on http://localhost:3001
bun run build    # production build (also the type check)
bun run start    # serve production build on :3001
bun run lint     # next lint (next/core-web-vitals + next/typescript)
```

Port 3001 is intentional: :3000 is reserved for the ATXFORGE marketing site. There is no test suite.

## Architecture

Data flows one way: `src/data/` -> `src/lib/` -> `src/components/DeskApp.tsx`.

- `src/data/types.ts` is the ingest schema (`Opportunity`, `WatchSource`, and the string-union enums `Track`, `Seniority`, `SalarySignal`, `Flexibility`, `SkillPartner`, `SourceType`, `OpportunityStatus`). Future scrapers/ingest routines are meant to emit this same shape.
- `src/data/opportunities.ts` holds raw entries typed `Omit<Opportunity, "score">[]`; each is passed through `scored()` which calls `computeForgeScore()`. Do not hand-write `score` unless deliberately overriding. Also exports `LAST_REFRESHED` (shown in the header; bump it when seed data changes).
- `src/data/sources.ts` lists watch sources shown in `SourcesPanel`.
- `src/lib/scoring.ts`: `computeForgeScore()` (base 28 + boosts - regex penalties on `title + contextExcerpt`, clamped 0-100, capped at 35 if `tracks` includes `poor-fit`) and `suggestTracks()`. `SCORING.md` documents every weight; keep the two in sync when changing either. (The JSDoc in `scoring.ts` still says "Base 40"; the code and SCORING.md use 28.)
- `src/lib/filters.ts`: `FilterState`, `filterOpportunities()` (track tab + filters + free-text query, sorted by score desc), `countByTab()`, and `trackFromHash()`.
- `src/components/DeskApp.tsx` is the only stateful client component and owns all state: items, active track tab, filters, and the open dossier id. Other components are presentational and receive props/callbacks.
- Track tabs are driven by the URL hash (`#all`, `#hire-replacement`, `#flexible`, `#build-creative`, `#poor-fit`); `DeskApp` listens to `hashchange` and writes back with `history.replaceState`. Adding a track means updating `Track` in types, `TrackTab`/`trackFromHash`/`countByTab` in filters, `TrackTabs`, and labels in `src/lib/labels.ts`.
- Status changes (New/Reviewing/Outreach/...) in `DossierDrawer` are in-memory only and reset on reload.

Path alias: `@/*` -> `src/*`.

## Adding an opportunity

Append to `raw` in `src/data/opportunities.ts` with all required `Opportunity` fields except `score`. Optional `screenshotPath` points under `public/` (e.g. `/screenshots/placeholder-dossier.svg`). See README.md for a full skeleton.

Provenance must be honest: seed/research rows set `sample: true`, and never describe seeded data as a live scrape. `contextExcerpt` is the source text that triggered the flag (scoring regexes and the dossier both read it). Show it in quote marks only when it is verbatim; otherwise it is a summary in our own words. Real leads never go in `opportunities.ts`: that file ships in the public client bundle.

## Domain vocabulary

- Tracks: `hire-replacement` (one senior seat covered by the bench), `flexible` (outcomes over hours, async), `build-creative` (real engineering / deploy / creative pipelines), `poor-fit` (rigid 9-5, daily office).
- `SkillPartner` values map to team members/capabilities: Peter (offer, messaging, CMO-shaped), Wilson (systems, integrations), Dev Shop (production engineering), Creative & Deploy (assets, launch execution).

## Brand

Ink/charcoal + ember orange (`#ff5c1a`), fonts Syne + DM Sans + Geist Mono; tokens live in `tailwind.config.ts` and `src/app/globals.css`. Matches the ATXFORGE marketing site.
