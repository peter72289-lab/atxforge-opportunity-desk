# ATXFORGE Forge Score & Track Rules

Transparent heuristics implemented in `src/lib/scoring.ts`. Scores are **0–100**.

## Forge score formula

```
score = 28
      + seniorityBoost
      + salaryBoost
      + flexibilityScore
      + skillOverlapBoost
      + build/creative language boosts
      + flexible language boost
      − rigid / junior / vibe-toy / sole-FTE penalties
clamp(0, 100)
```

If `tracks` includes `poor-fit`, score is capped at **35**.

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

### Skill overlap (partners matched)

| Distinct skills | Boost |
|-----------------|------:|
| 3+              | +14   |
| 2               | +8    |
| 1               | +2    |

### Language boosts (title + context excerpt)

- Build/deploy/production/engineering/integration/creative asset/funnel/launch + matching partner:
  - Dev Shop +6 · Creative & Deploy +5 · Wilson +4
- Flexible/async/outcomes/growth/fractional/retainer language: **+6**

### Penalties

| Pattern | Penalty |
|---------|--------:|
| 9–5 / must be in-office / on-site daily / EST-only / timezone mandatory | −18 |
| Junior / associate / intern / entry-level / coordinator | −20 |
| Vibe-code / prototype only / toy / no deploy | −12 |
| Sole FTE / only hire / single person in office | −10 |

## Track assignment

Suggested by `suggestTracks()` (also assign manually in seed data):

| Track | When |
|-------|------|
| **hire-replacement** | Senior title or $100k+/fractional; language about owning/leading/replacing a seat |
| **flexible** | `flexibility: Flexible` or async / outcomes / set-your-own-hours / fractional language |
| **build-creative** | Dev Shop or Creative & Deploy skills, or deploy/creative/engineering language |
| **poor-fit** | Rigid flexibility or 9–5 / daily office without flex language |

An opportunity may carry **multiple** tracks (e.g. hire-replacement + flexible + build-creative).

## Philosophy

- **Boost** seats a microagency can cover better than one FTE: multi-skill, senior scope, continuity.
- **Penalize** rigid theater, junior IC tickets, and prototype-only toys with no production path.
- Always quote the **context excerpt** that triggered the flag in the dossier.
