import type {
  Flexibility,
  Opportunity,
  SalarySignal,
  Seniority,
  SkillPartner,
  Track,
} from "@/data/types";

/** Bump when any weight or pattern changes, so stored scores can be compared. */
export const SCORE_VERSION = "2";

export const BASE_SCORE = 28;

/** Applied when the hand-set tracks include poor-fit. */
export const POOR_FIT_CAP = 35;

export const SENIORITY_BOOST: Record<Seniority, number> = {
  "Co-founder": 20,
  "C-level": 18,
  VP: 16,
  Director: 12,
  Head: 10,
  "Other senior": 6,
};

export const SALARY_BOOST: Record<SalarySignal, number> = {
  "$100k+": 14,
  "Fractional rate": 12,
  Undisclosed: 4,
  "Below $100k": -8,
};

export const FLEX_SCORE: Record<Flexibility, number> = {
  Flexible: 14,
  Unknown: 4,
  Rigid: -22,
};

/** Keyed by distinct skill count; 3 means 3 or more. */
export const SKILL_OVERLAP_BOOST: Record<1 | 2 | 3, number> = {
  1: 2,
  2: 8,
  3: 14,
};

/** Build language plus at least one build partner (Dev Shop, Creative & Deploy, Wilson). Counted once. */
export const BUILD_BOOST = 6;

/** Flexible-work language. Only counted when flexibility is Unknown, so a Flexible tag isn't counted twice. */
export const FLEX_LANGUAGE_BOOST = 6;

export const PENALTIES = {
  rigid: 18,
  junior: 20,
  vibe: 12,
  soleHire: 10,
} as const;

export type PenaltyKey = keyof typeof PENALTIES;

const BUILD_PARTNERS: SkillPartner[] = [
  "Dev Shop",
  "Creative & Deploy",
  "Wilson",
];

// Patterns. All use word boundaries; global flag so every match can be checked for negation.
const BUILD_RE =
  /\b(?:deploy(?:s|ed|ing|ment)?|production|engineering|integrations?|systems?|(?<!\b(?:brand|team|relationship|community)[- ])build(?:s|ing)?|ship(?:s|ping)?|launch(?:es|ing)?|creative assets?|funnels?|landing pages?)\b/g;

const FLEX_LANGUAGE_RE =
  /\b(?:async|flexible|set your own hours|get the job done|outcomes|retainer|fractional)\b/g;

const RIGID_RE = new RegExp(
  [
    // 9-5, 9am-5pm, 9 to 5; "49-55" and "$9-5M" don't count
    String.raw`(?<![\d$.])9\s*(?:a\.?m\.?)?\s*(?:-|–|—|to)\s*5\s*(?:p\.?m\.?)?(?![\d%kmb])`,
    String.raw`\bmust be in[- ]office\b`,
    // "on-site"/"onsite", not "on site SEO", "on-site visits" or hybrid "on-site 2 days a week"
    String.raw`\bon-?site\b(?! visits?\b| as needed\b| optional\b|[^.,;]{0,20}?\b[1-3] days?\b)`,
    String.raw`\bin[- ]office (?:daily|every day)\b`,
    // "office 5 days/week", "in-office 5 days"
    String.raw`\b(?:office|on-?site|in[- ]person)\b[^.,;]{0,30}?\b[45] days\b`,
    String.raw`\b[45] days\b[^.,;]{0,20}?\b(?:in[- ]office|in the office|on-?site)\b`,
    // "in office Monday-Friday"
    String.raw`\b(?:in[- ]office|in the office|on-?site)\b[^.]{0,20}?\bmon(?:day)?\s*(?:-|–|to|through)\s*fri(?:day)?\b`,
    String.raw`\best only\b`,
    String.raw`\b(?:eastern|pacific|central) time (?:only|required)\b`,
    String.raw`\btime ?zone (?:is )?mandatory\b`,
  ].join("|"),
  "g"
);

// Read against the title only, so "internal", "mentor a junior engineer" etc. in the excerpt don't trip it.
const JUNIOR_TITLE_RE =
  /\b(?:junior|jr\b\.?|intern(?:ship)?|entry[- ]level|entry to mid|early[- ]career|coordinator|associate(?! (?:director|vp|vice president|partner)\b))(?=\W|$)/g;

// These patterns carry their own "no", so they are not negation-checked.
const VIBE_RE =
  /\b(?:vibe[- ]?cod\w*|prototype only|toy project|no deploy(?:ment)?(?: path)?)\b/g;

const SOLE_HIRE_RE =
  /\b(?:sole\b[^.]{0,30}?\bfte|only hire|single person in office|full[- ]time employees? only|no agencies)\b/g;

const NEGATOR_RE = /^(?:no|not|without|never|non)$/;

/** True if one of the 3 words before `index` in the same clause is a negator ("no deploy path"). */
export function isNegated(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 60), index);
  const clause = before.split(/[.,;:!?()—–]/).pop() ?? "";
  const words = clause
    .split(/[\s/]+/)
    .map((w) => w.replace(/[^a-z-]/g, ""))
    .filter(Boolean)
    .slice(-3);
  // "non-" only as a bare prefix ("non-production"), so "non-negotiable" doesn't negate.
  return words.some((w) => NEGATOR_RE.test(w) || w === "non-");
}

/** First match of `re` in `text` that isn't negated, or null. */
function firstMatch(
  text: string,
  re: RegExp,
  checkNegation = true
): string | null {
  re.lastIndex = 0;
  for (const m of Array.from(text.matchAll(re))) {
    if (!checkNegation || !isNegated(text, m.index ?? 0)) return m[0];
  }
  return null;
}

export interface ScoreContribution {
  label: string;
  points: number;
  /** The text a pattern rule matched, when the rule is a pattern. */
  matched?: string;
}

export interface ScoreExplanation {
  score: number;
  version: string;
  contributions: ScoreContribution[];
}

export interface ScoreInput {
  seniority: Seniority;
  salarySignal: SalarySignal;
  flexibility: Flexibility;
  skills: SkillPartner[];
  tracks: Track[];
  contextExcerpt: string;
  title: string;
}

/**
 * Transparent forge-score heuristics (also documented in SCORING.md).
 * Base 28 + boosts − penalties, then the poor-fit cap (35), clamped 0–100.
 * Contributions always sum to the returned score.
 */
export function explainForgeScore(input: ScoreInput): ScoreExplanation {
  const contributions: ScoreContribution[] = [];
  const add = (label: string, points: number, matched?: string) => {
    contributions.push(
      matched === undefined ? { label, points } : { label, points, matched }
    );
  };

  add("Base", BASE_SCORE);
  add(`Seniority: ${input.seniority}`, SENIORITY_BOOST[input.seniority]);
  add(`Salary: ${input.salarySignal}`, SALARY_BOOST[input.salarySignal]);
  add(`Flexibility: ${input.flexibility}`, FLEX_SCORE[input.flexibility]);

  const uniqueSkills = new Set(input.skills);
  if (uniqueSkills.size > 0) {
    const key = Math.min(uniqueSkills.size, 3) as 1 | 2 | 3;
    add(`Skill overlap: ${uniqueSkills.size}`, SKILL_OVERLAP_BOOST[key]);
  }

  const title = input.title.toLowerCase();
  const blob = `${title} ${input.contextExcerpt.toLowerCase()}`;

  const build = firstMatch(blob, BUILD_RE);
  if (build && BUILD_PARTNERS.some((p) => uniqueSkills.has(p))) {
    add("Build language + build partner", BUILD_BOOST, build);
  }

  if (input.flexibility === "Unknown") {
    const flex = firstMatch(blob, FLEX_LANGUAGE_RE);
    if (flex) add("Flexible-work language", FLEX_LANGUAGE_BOOST, flex);
  }

  const rigid = firstMatch(blob, RIGID_RE);
  if (rigid) add("Rigid hours or office", -PENALTIES.rigid, rigid);

  const junior = firstMatch(title, JUNIOR_TITLE_RE, false);
  if (junior) add("Junior title", -PENALTIES.junior, junior);

  const vibe = firstMatch(blob, VIBE_RE, false);
  if (vibe) add("Prototype or toy only", -PENALTIES.vibe, vibe);

  const sole = firstMatch(blob, SOLE_HIRE_RE);
  if (sole) add("Sole FTE / no agencies", -PENALTIES.soleHire, sole);

  let total = contributions.reduce((sum, c) => sum + c.points, 0);

  if (input.tracks.includes("poor-fit") && total > POOR_FIT_CAP) {
    add(`Poor-fit cap (${POOR_FIT_CAP})`, POOR_FIT_CAP - total);
    total = POOR_FIT_CAP;
  }

  const clamped = Math.max(0, Math.min(100, total));
  if (clamped !== total) add("Clamp to 0–100", clamped - total);

  return { score: clamped, version: SCORE_VERSION, contributions };
}

export function computeForgeScore(input: ScoreInput): number {
  return explainForgeScore(input).score;
}

/**
 * Suggests tracks from post text. Not used by the UI yet; hand-set tracks win.
 * Returns [] when nothing matches, which should read as "Needs triage".
 */
export function suggestTracks(input: {
  seniority: Seniority;
  flexibility: Flexibility;
  salarySignal: SalarySignal;
  skills: SkillPartner[];
  contextExcerpt: string;
  title: string;
}): Track[] {
  const title = input.title.toLowerCase();
  const blob = `${title} ${input.contextExcerpt.toLowerCase()}`;
  const junior = firstMatch(title, JUNIOR_TITLE_RE, false) !== null;

  const rigid =
    input.flexibility === "Rigid" || firstMatch(blob, RIGID_RE) !== null;
  // Only an explicit remote-first or flexible schedule rescues a rigid post; bare "async" doesn't.
  const rigidExcused =
    firstMatch(blob, /\b(?:remote[- ]first|flexible schedule)\b/g) !== null;

  if (
    (rigid && !rigidExcused) ||
    junior ||
    firstMatch(blob, VIBE_RE, false) !== null
  ) {
    // Poor-fit suppresses the other tracks.
    return ["poor-fit"];
  }

  const tracks: Track[] = [];
  const senior =
    input.seniority !== "Other senior" ||
    input.salarySignal === "$100k+" ||
    input.salarySignal === "Fractional rate";

  if (
    senior &&
    (input.salarySignal !== "Below $100k" ||
      firstMatch(
        blob,
        /\b(?:co[- ]?founder|vp|director|head of|cmo|cto|coo|ceo|replace|own the|lead marketing|growth lead)\b/g
      ) !== null)
  ) {
    tracks.push("hire-replacement");
  }

  if (
    input.flexibility === "Flexible" ||
    firstMatch(
      blob,
      /\b(?:async|flexible|set your own hours|outcomes over hours|fractional|retainer)\b/g
    ) !== null
  ) {
    tracks.push("flexible");
  }

  if (
    input.skills.some((s) => s === "Dev Shop" || s === "Creative & Deploy") ||
    firstMatch(
      blob,
      /\b(?:deploy(?:s|ed|ing|ment)?|creative|assets?|engineering|(?<!\b(?:brand|team|relationship|community)[- ])build(?:s|ing)?|landing pages?|funnels?|integrations?)\b/g
    ) !== null
  ) {
    tracks.push("build-creative");
  }

  return tracks;
}

export function withComputedScore(
  opp: Omit<Opportunity, "score"> & { score?: number }
): Opportunity {
  const score =
    opp.score ??
    computeForgeScore({
      seniority: opp.seniority,
      salarySignal: opp.salarySignal,
      flexibility: opp.flexibility,
      skills: opp.skills,
      tracks: opp.tracks,
      contextExcerpt: opp.contextExcerpt,
      title: opp.title,
    });
  return { ...opp, score } as Opportunity;
}
