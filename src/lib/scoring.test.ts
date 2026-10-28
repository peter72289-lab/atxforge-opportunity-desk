import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { opportunities } from "@/data/opportunities";
import type { Opportunity } from "@/data/types";
import { defaultFilters, filterOpportunities } from "@/lib/filters";
import {
  BASE_SCORE,
  BUILD_BOOST,
  FLEX_LANGUAGE_BOOST,
  FLEX_SCORE,
  PENALTIES,
  POOR_FIT_CAP,
  SALARY_BOOST,
  SCORE_VERSION,
  SENIORITY_BOOST,
  SKILL_OVERLAP_BOOST,
  type ScoreInput,
  computeForgeScore,
  explainForgeScore,
  suggestTracks,
} from "@/lib/scoring";

const byId = (id: string): Opportunity => {
  const o = opportunities.find((x) => x.id === id);
  if (!o) throw new Error(`missing seed ${id}`);
  return o;
};

const labels = (input: ScoreInput) =>
  explainForgeScore(input).contributions.map((c) => c.label);

const has = (input: ScoreInput, label: string) => labels(input).includes(label);

// A neutral senior row; tests override title and excerpt.
const base: ScoreInput = {
  seniority: "Head",
  salarySignal: "$100k+",
  flexibility: "Unknown",
  skills: ["Peter", "Wilson"],
  tracks: [],
  title: "Director",
  contextExcerpt: "",
};

const RIGID = "Rigid hours or office";
const JUNIOR = "Junior title";
const BUILD = "Build language + build partner";
const FLEX_LANG = "Flexible-work language";
const VIBE = "Prototype or toy only";
const SOLE = "Sole FTE / no agencies";

describe("seed rows", () => {
  const viable = opportunities.filter((o) => !o.tracks.includes("poor-fit"));
  const poor = opportunities.filter((o) => o.tracks.includes("poor-fit"));

  test("there are 18 seeds, 15 viable and 3 poor-fit", () => {
    expect(opportunities.length).toBe(18);
    expect(viable.length).toBe(15);
    expect(poor.length).toBe(3);
  });

  test("stored score equals computeForgeScore and contributions sum to it", () => {
    for (const o of opportunities) {
      const e = explainForgeScore(o);
      expect(o.score).toBe(e.score);
      expect(computeForgeScore(o)).toBe(e.score);
      expect(e.version).toBe(SCORE_VERSION);
      expect(e.contributions.reduce((s, c) => s + c.points, 0)).toBe(e.score);
    }
  });

  test("no seed needs the 0-100 clamp from above", () => {
    for (const o of viable) {
      expect(o.score).toBeLessThanOrEqual(100);
      expect(labels(o)).not.toContain("Clamp to 0–100");
    }
  });

  test("every viable row outranks every poor-fit row", () => {
    const minViable = Math.min(...viable.map((o) => o.score));
    const maxPoor = Math.max(...poor.map((o) => o.score));
    expect(minViable).toBeGreaterThan(maxPoor);
    for (const o of poor) expect(o.score).toBeLessThanOrEqual(POOR_FIT_CAP);
  });

  test("no viable row takes the junior penalty (H8)", () => {
    for (const o of viable) expect(labels(o)).not.toContain(JUNIOR);
  });

  test("ForgeLine: internal IT liaison is not 'intern'", () => {
    const o = byId("opp-industrial-digital");
    expect(has(o, JUNIOR)).toBe(false);
    expect(o.score).toBeGreaterThanOrEqual(70);
  });

  test("BayRoute: internal ops dashboard is not 'intern'", () => {
    const o = byId("opp-logistics-integrations");
    expect(has(o, JUNIOR)).toBe(false);
    expect(o.score).toBeGreaterThanOrEqual(70);
  });

  test("GreenMeter: mentor a junior engineer is not a junior title", () => {
    const o = byId("opp-climate-cto-fractional");
    expect(has(o, JUNIOR)).toBe(false);
    expect(o.score).toBeGreaterThan(byId("opp-industrial-digital").score);
  });

  test("Everist: 'Brand building' is not build language", () => {
    expect(has(byId("opp-everist-vp-mkt"), BUILD)).toBe(false);
  });

  test("agency B2B: partnerships/ownership are not 'ship'", () => {
    expect(has(byId("opp-agency-b2b-dir"), BUILD)).toBe(false);
  });

  test("Head of Growth seed gets no flexibility boost from 'growth'", () => {
    expect(has(byId("opp-fintech-head-growth"), FLEX_LANG)).toBe(false);
  });

  test("poor-fit rows hit their penalties", () => {
    const northBank = byId("opp-poor-eastern-ae");
    expect(has(northBank, RIGID)).toBe(true);
    expect(has(northBank, SOLE)).toBe(true);

    const coordinator = byId("opp-poor-onsite-coordinator");
    expect(has(coordinator, RIGID)).toBe(true);
    expect(has(coordinator, JUNIOR)).toBe(true);

    const vibe = byId("opp-poor-vibe-only");
    expect(has(vibe, VIBE)).toBe(true);
    // "No deploy path, no production hardening" is negated build language.
    expect(has(vibe, BUILD)).toBe(false);
  });

  test("suggestTracks marks the three poor-fit seeds poor-fit and nothing else", () => {
    for (const o of poor) expect(suggestTracks(o)).toEqual(["poor-fit"]);
  });

  test("suggestTracks never calls a viable seed poor-fit", () => {
    for (const o of viable) expect(suggestTracks(o)).not.toContain("poor-fit");
  });
});

describe("adversarial strings (H8, M5)", () => {
  test("Jr. Growth Marketer takes the junior penalty, no growth boost", () => {
    const input = {
      ...base,
      title: "Jr. Growth Marketer",
      contextExcerpt: "Own growth experiments.",
    };
    expect(has(input, JUNIOR)).toBe(true);
    expect(has(input, FLEX_LANG)).toBe(false);
  });

  test("other junior titles", () => {
    for (const title of [
      "Marketing Intern",
      "Junior Designer",
      "Entry-level Analyst",
      "Early career Marketer",
      "Brand Coordinator",
      "Marketing Associate",
    ]) {
      expect(has({ ...base, title }, JUNIOR)).toBe(true);
    }
    expect(
      has({ ...base, title: "Associate Director of Marketing" }, JUNIOR)
    ).toBe(false);
    expect(has({ ...base, title: "International Growth Lead" }, JUNIOR)).toBe(
      false
    );
  });

  test("junior words in the excerpt don't count", () => {
    const input = {
      ...base,
      contextExcerpt:
        "Mentor a junior engineer. Internal IT liaison. International rollout. Entry-level team.",
    };
    expect(has(input, JUNIOR)).toBe(false);
  });

  test("9am-5pm Marketing Manager is rigid", () => {
    expect(has({ ...base, title: "9am-5pm Marketing Manager" }, RIGID)).toBe(
      true
    );
  });

  test("Head of Growth with a 49-55 person team is not rigid", () => {
    const input = {
      ...base,
      title: "Head of Growth",
      contextExcerpt: "Lead a 49-55 person team.",
    };
    expect(has(input, RIGID)).toBe(false);
    expect(has(input, FLEX_LANG)).toBe(false);
  });

  test("interest only is not EST only", () => {
    expect(
      has({ ...base, contextExcerpt: "Interest only loans." }, RIGID)
    ).toBe(false);
    expect(
      has({ ...base, contextExcerpt: "Meetings are EST only." }, RIGID)
    ).toBe(true);
  });

  test("partnerships and ownership are not 'ship'", () => {
    const input = {
      ...base,
      contextExcerpt: "Partnerships and ownership of the brand.",
    };
    expect(has(input, BUILD)).toBe(false);
    expect(has({ ...base, contextExcerpt: "Ship the new site." }, BUILD)).toBe(
      true
    );
  });

  test("negated build language earns nothing", () => {
    expect(has({ ...base, contextExcerpt: "No deploy path." }, BUILD)).toBe(
      false
    );
    expect(
      has({ ...base, contextExcerpt: "There is no production system." }, BUILD)
    ).toBe(false);
    expect(
      has(
        {
          ...base,
          contextExcerpt: "Ship production software, not prototypes.",
        },
        BUILD
      )
    ).toBe(true);
  });

  test("missed rigid phrasings from M5", () => {
    for (const excerpt of [
      "In-office 5 days.",
      "This role is on-site.",
      "Monday to Friday 9am to 5pm.",
      "Work 9 to 5.",
      "In office Monday-Friday.",
      "NYC office 5 days/week.",
    ]) {
      expect(has({ ...base, contextExcerpt: excerpt }, RIGID)).toBe(true);
    }
    expect(has({ ...base, contextExcerpt: "Not a 9 to 5 role." }, RIGID)).toBe(
      false
    );
    expect(
      has({ ...base, contextExcerpt: "On-site visits optional." }, RIGID)
    ).toBe(false);
  });

  test("look-alike rigid phrasings don't count", () => {
    for (const excerpt of [
      "Own on site SEO and site speed.",
      "Hybrid: 2 days in office, 4 days remote.",
      "On-site 2 days a week, otherwise remote.",
      "We raised $9-5M last year.",
    ]) {
      expect(has({ ...base, contextExcerpt: excerpt }, RIGID)).toBe(false);
    }
    // "non-negotiable" is not a negator; "non-" as a bare prefix is.
    expect(
      has({ ...base, contextExcerpt: "Non-negotiable 9-5 hours." }, RIGID)
    ).toBe(true);
    expect(
      has({ ...base, contextExcerpt: "Non-production sandbox." }, BUILD)
    ).toBe(false);
    expect(
      has({ ...base, contextExcerpt: "Team-building offsites." }, BUILD)
    ).toBe(false);
  });

  test("full-time employee only is a sole-hire penalty", () => {
    expect(
      has({ ...base, contextExcerpt: "Full-time employee only." }, SOLE)
    ).toBe(true);
    expect(
      has({ ...base, contextExcerpt: "Sole marketing ops FTE." }, SOLE)
    ).toBe(true);
    expect(
      has(
        {
          ...base,
          contextExcerpt: "Contractors welcome, not full-time employees only.",
        },
        SOLE
      )
    ).toBe(false);
  });

  test("flexible-work language counts once, only when flexibility is Unknown", () => {
    const text = "Async, outcomes, fractional retainer.";
    expect(has({ ...base, contextExcerpt: text }, FLEX_LANG)).toBe(true);
    expect(
      has({ ...base, flexibility: "Flexible", contextExcerpt: text }, FLEX_LANG)
    ).toBe(false);
  });

  test("a rigid junior row scores below a clean senior row", () => {
    const good = computeForgeScore({
      ...base,
      contextExcerpt: "Own the funnel and ship landing pages.",
    });
    const bad = computeForgeScore({
      ...base,
      title: "Jr. Marketing Coordinator",
      contextExcerpt: "9am-5pm in office.",
    });
    expect(good).toBeGreaterThan(bad + 30);
  });
});

describe("exact values that document a rule", () => {
  test("base row with no matches is the sum of its table weights", () => {
    const input: ScoreInput = { ...base, skills: [], contextExcerpt: "" };
    expect(computeForgeScore(input)).toBe(
      BASE_SCORE +
        SENIORITY_BOOST.Head +
        SALARY_BOOST["$100k+"] +
        FLEX_SCORE.Unknown
    );
  });

  test("poor-fit cap is applied and shown as a contribution", () => {
    const e = explainForgeScore({ ...base, tracks: ["poor-fit"] });
    expect(e.score).toBe(POOR_FIT_CAP);
    expect(e.contributions.map((c) => c.label)).toContain(
      `Poor-fit cap (${POOR_FIT_CAP})`
    );
  });

  test("score never goes below 0", () => {
    const e = explainForgeScore({
      ...base,
      seniority: "Other senior",
      salarySignal: "Below $100k",
      flexibility: "Rigid",
      title: "Junior Coordinator",
      contextExcerpt: "9-5 on-site. Vibe-code a toy project. Sole FTE.",
    });
    expect(e.score).toBe(0);
    expect(e.contributions.reduce((s, c) => s + c.points, 0)).toBe(0);
  });
});

describe("suggestTracks (M4)", () => {
  test("Office Assistant is not hire-replacement; returns [] for triage", () => {
    expect(
      suggestTracks({
        seniority: "Other senior",
        flexibility: "Unknown",
        salarySignal: "Below $100k",
        skills: [],
        title: "Office Assistant",
        contextExcerpt: "Answer phones and greet visitors.",
      })
    ).toEqual([]);
  });

  test("bare async doesn't excuse a rigid VP; remote-first does", () => {
    const vp = {
      seniority: "VP" as const,
      flexibility: "Unknown" as const,
      salarySignal: "$100k+" as const,
      skills: [],
      title: "VP Marketing",
    };
    expect(
      suggestTracks({
        ...vp,
        contextExcerpt: "Must be in-office. Async updates.",
      })
    ).toEqual(["poor-fit"]);
    expect(
      suggestTracks({
        ...vp,
        contextExcerpt:
          "Must be in-office for launches, otherwise remote-first.",
      })
    ).not.toContain("poor-fit");
  });

  test("senior title marked Below $100k still gets hire-replacement via keywords", () => {
    expect(
      suggestTracks({
        seniority: "Director",
        flexibility: "Unknown",
        salarySignal: "Below $100k",
        skills: [],
        title: "Director of Marketing",
        contextExcerpt: "",
      })
    ).toContain("hire-replacement");
  });
});

describe("filterOpportunities sort", () => {
  test("score desc, then seenAt desc, then id", () => {
    const row = (id: string, score: number, seenAt: string) =>
      ({ ...opportunities[0], id, score, seenAt }) as Opportunity;
    const sorted = filterOpportunities(
      [
        row("b", 80, "2026-09-01"),
        row("a", 80, "2026-09-01"),
        row("c", 80, "2026-09-05"),
        row("d", 90, "2026-08-01"),
      ],
      "all",
      defaultFilters
    );
    expect(sorted.map((o) => o.id)).toEqual(["d", "c", "a", "b"]);
  });

  test("seed order is deterministic regardless of input order", () => {
    const a = filterOpportunities(opportunities, "all", defaultFilters).map(
      (o) => o.id
    );
    const b = filterOpportunities(
      [...opportunities].reverse(),
      "all",
      defaultFilters
    ).map((o) => o.id);
    expect(b).toEqual(a);
  });
});

describe("SCORING.md matches the code", () => {
  const md = readFileSync(join(import.meta.dir, "../../SCORING.md"), "utf8");

  // Rows of the first markdown table after a "### heading" line, header and separator dropped.
  const table = (heading: string): string[][] => {
    const lines = md.split("\n");
    const start = lines.findIndex((l) => l.trim() === `### ${heading}`);
    if (start < 0) throw new Error(`SCORING.md has no "### ${heading}"`);
    const rows: string[][] = [];
    let inTable = false;
    for (const line of lines.slice(start + 1)) {
      if (line.startsWith("#")) break;
      if (line.trim().startsWith("|")) {
        inTable = true;
        rows.push(
          line
            .trim()
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim())
        );
      } else if (inTable) break;
    }
    return rows.slice(2);
  };

  const num = (cell: string) =>
    Number(cell.replace(/[−–]/g, "-").replace(/\+/g, ""));
  const key = (cell: string) => cell.replace(/`/g, "");

  const asRecord = (heading: string) =>
    Object.fromEntries(table(heading).map((r) => [key(r[0]), num(r[1])]));

  test("seniority", () => {
    expect(asRecord("Seniority boost")).toEqual(SENIORITY_BOOST);
  });

  test("salary", () => {
    expect(asRecord("Salary signal")).toEqual(SALARY_BOOST);
  });

  test("flexibility", () => {
    expect(asRecord("Flexibility")).toEqual(FLEX_SCORE);
  });

  test("skill overlap", () => {
    const rec = Object.fromEntries(
      table("Skill overlap").map((r) => [String(parseInt(r[0], 10)), num(r[1])])
    );
    expect(rec).toEqual({ ...SKILL_OVERLAP_BOOST });
  });

  test("constants", () => {
    expect(asRecord("Constants")).toEqual({
      BASE_SCORE,
      POOR_FIT_CAP,
      BUILD_BOOST,
      FLEX_LANGUAGE_BOOST,
    });
  });

  test("penalties", () => {
    const rec = Object.fromEntries(
      table("Penalties").map((r) => [key(r[0]), -num(r[1])])
    );
    expect(rec).toEqual({ ...PENALTIES });
  });

  test("formula block states the base and cap", () => {
    expect(md).toContain(`score = ${BASE_SCORE} (base)`);
    expect(md).toContain(`min(score, ${POOR_FIT_CAP})`);
    expect(md).toContain(`SCORE_VERSION = "${SCORE_VERSION}"`);
  });
});
