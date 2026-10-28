# ATXFORGE Forge Score & Track Rules

Transparent heuristics implemented in `src/lib/scoring.ts`. Scores are **0–100**. Current version: `SCORE_VERSION = "3"`.

`src/lib/scoring.test.ts` parses the tables below and fails if they drift from the code constants. Change both together.

## Forge score formula

```
score = 28 (base)
      + seniorityBoost
      + salaryBoost
      + flexibilityScore
      + skillOverlapBoost
      + build language boost (once)
      + flexible-work language boost (only when flexibility is Unknown)
      − rigid / junior-title / prototype-only / sole-FTE penalties
if tracks include poor-fit: min(score, 35)
clamp(0, 100)
```

The weights top out at 96, so the clamp is only a guard. `explainForgeScore()` returns `{ score, version, contributions }`, where each contribution is `{ label, points, matched? }` and the points always sum to the score. `computeForgeScore()` returns just the number.

### Constants

| Constant              | Value |
|-----------------------|------:|
| `BASE_SCORE`          | 28    |
| `POOR_FIT_CAP`        | 35    |
| `BUILD_BOOST`         | +6    |
| `FLEX_LANGUAGE_BOOST` | +6    |

### Seniority boost

| Seniority     | Boost |
|---------------|------:|
| Co-founder    | +20   |
| C-level       | +18   |
| VP            | +16   |
| Director      | +12   |
| Head          | +10   |
| Other senior  | +6    |

### Salary signal

| Signal           | Boost |
|------------------|------:|
| $100k+           | +14   |
| Fractional rate  | +12   |
| Undisclosed      | +4    |
| Below $100k      | −8    |

### Flexibility

| Flexibility | Score |
|-------------|------:|
| Flexible    | +14   |
| Unknown     | +4    |
| Rigid       | −22   |

### Skill overlap

Distinct partners in `skills`.

| Distinct skills | Boost |
|-----------------|------:|
| 3+              | +14   |
| 2               | +8    |
| 1               | +2    |

### Language boosts (title + context excerpt)

All patterns use word boundaries. A match is ignored when one of the two words before it, in the same clause, is a negator: `no`, `not`, `without`, `never`, a contraction (isn't, aren't, wasn't, weren't, won't, don't, doesn't, didn't, can't, cannot) or a bare `non-` prefix ("non-production"; "non-negotiable" is not a negator). Filler words (a, an, the, to, be, is, are, in, on, at, any) are skipped when counting, so "don't need to be on-site" is negated. Clauses end at `. , ; : ! ? ( ) — –`, so "No relocation required. Onsite daily." is still rigid.

- **Build language** (`BUILD_BOOST`, counted once): deploy, production, engineering, integration(s), system(s), build/building (not "brand/team/relationship/community building" or "team-building"), ship/ships/shipping (not "partnership" or "ownership"), launch, creative asset(s), funnel(s), landing page(s). Only counts if `skills` includes Dev Shop, Creative & Deploy or Wilson.
- **Flexible-work language** (`FLEX_LANGUAGE_BOOST`): async, flexible, set your own hours, get the job done, outcomes, retainer, fractional. Only counts when `flexibility` is Unknown, since a Flexible tag already earns +14. "growth" is not a flexibility signal.

### Penalties

| Rule       | Penalty | Patterns |
|------------|--------:|----------|
| `rigid`    | −18     | Working-hours ranges from 7–10 to 3–7, with optional `:00` and am/pm: 9-5, 9-to-5, 9 to 5, 9am-5pm, 9:00 am - 5:00 pm, 8-5, 8am-6pm (not "49-55" or "$9-5M"); must be in-office / in the office / on site, must work on site; fully in-office / in-person / on-site; on-site or onsite (not "on site SEO", "on-site visits", "as needed", "optional", or hybrid "on-site 1–3 days"); in-office daily; office/on-site within the same clause as "4 days", "5 days", "four days" or "five days"; in office Monday–Friday; EST/PST/CST/MST (or EDT, PDT...) only (not "interest only"); Eastern/Pacific/Central/Mountain time only or required; timezone mandatory. Negation-checked ("not a 9 to 5", "isn't a 9-5"). |
| `junior`   | −20     | **Title only**: junior, jr, jr., intern, internship, entry-level, entry to mid, early career, coordinator, associate (not Senior Associate, or Associate [any one word] Director, VP, Vice President / Vice-President, Partner, General Counsel, Principal). The excerpt is not read, so "internal", "international" and "mentor a junior engineer" don't count. |
| `vibe`     | −12     | Always: prototype only, no deploy, no deploy path. Vibe-code / vibe coding / toy project only when the post has no un-negated production intent (production, deploy, ship, launch, go live), so "turn our vibe-coded prototype into a production system" is a build job; these are negation-checked. |
| `soleHire` | −10     | sole … FTE (within 30 characters), only hire, single person in office, full-time employee(s) only, no agencies. Negation-checked. |

Each penalty applies at most once.

## Track assignment

`suggestTracks()` is not used by the UI; the hand-set tracks in the seed data win. It returns `[]` when nothing matches, which should read as "Needs triage".

| Track | When |
|-------|------|
| **poor-fit** | Rigid flexibility or a rigid pattern (unless the post says remote-first or flexible schedule, not negated before or after, so "a flexible schedule is not offered" doesn't excuse it; bare "async" doesn't either), a junior title, or a prototype-only pattern. Poor-fit suppresses every other track. |
| **hire-replacement** | Senior (any seniority except Other senior, or $100k+ / Fractional rate) and not Below $100k; or senior with leadership/replace language (co-founder, VP, director, head of, CMO, CTO, COO, CEO, replace, own the, lead marketing, growth lead). |
| **flexible** | `flexibility: Flexible`, or async / flexible / set your own hours / outcomes over hours / fractional / retainer language. |
| **build-creative** | Dev Shop or Creative & Deploy skills, or deploy / creative / asset / engineering / build / landing page / funnel / integration language. |

An opportunity may carry **multiple** tracks (e.g. hire-replacement + flexible + build-creative).

## Sort order

`filterOpportunities()` sorts by score (high first), then `seenAt` (newest first), then `id`.

## Philosophy

- **Boost** seats a microagency can cover better than one FTE: multi-skill, senior scope, continuity.
- **Penalize** rigid theater, junior IC tickets, and prototype-only toys with no production path.
- Always quote the **context excerpt** that triggered the flag in the dossier.
