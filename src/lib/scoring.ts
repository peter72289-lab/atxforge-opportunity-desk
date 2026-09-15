import type {
  Flexibility,
  Opportunity,
  SalarySignal,
  Seniority,
  SkillPartner,
  Track,
} from "@/data/types";

const SENIORITY_BOOST: Record<Seniority, number> = {
  "Co-founder": 20,
  "C-level": 18,
  VP: 16,
  Director: 12,
  Head: 10,
  "Other senior": 6,
};

const SALARY_BOOST: Record<SalarySignal, number> = {
  "$100k+": 14,
  "Fractional rate": 12,
  Undisclosed: 4,
  "Below $100k": -8,
};

const FLEX_SCORE: Record<Flexibility, number> = {
  Flexible: 14,
  Unknown: 4,
  Rigid: -22,
};

/**
 * Transparent forge-score heuristics (also documented in SCORING.md).
 * Base 40 + boosts − penalties, clamped 0–100.
 */
export function computeForgeScore(input: {
  seniority: Seniority;
  salarySignal: SalarySignal;
  flexibility: Flexibility;
  skills: SkillPartner[];
  tracks: Track[];
  contextExcerpt: string;
  title: string;
}): number {
  let score = 28;

  score += SENIORITY_BOOST[input.seniority];
  score += SALARY_BOOST[input.salarySignal];
  score += FLEX_SCORE[input.flexibility];

  const uniqueSkills = new Set(input.skills);
  if (uniqueSkills.size >= 3) score += 14;
  else if (uniqueSkills.size === 2) score += 8;
  else if (uniqueSkills.size === 1) score += 2;

  const blob = `${input.title} ${input.contextExcerpt}`.toLowerCase();
  const needsBuild =
    /deploy|production|engineering|integration|system|build|ship|launch|creative asset|funnel|landing page/.test(
      blob
    );
  if (needsBuild && uniqueSkills.has("Dev Shop")) score += 6;
  if (needsBuild && uniqueSkills.has("Creative & Deploy")) score += 5;
  if (needsBuild && uniqueSkills.has("Wilson")) score += 4;

  if (
    /async|flexible|set your own hours|get the job done|outcomes|growth|retainer|fractional/.test(
      blob
    )
  ) {
    score += 6;
  }

  if (
    /9[\s–-]5|must be in[- ]office|on[- ]site daily|eastern time|est only|timezone mandatory/.test(
      blob
    )
  ) {
    score -= 18;
  }
  if (/junior|associate|intern|entry[- ]level|coordinator/.test(blob)) {
    score -= 20;
  }
  if (/vibe.?cod|prototype only|toy project|no deploy/.test(blob)) {
    score -= 12;
  }
  if (/sole fte|only hire|single person in office/.test(blob)) {
    score -= 10;
  }

  if (input.tracks.includes("poor-fit")) {
    score = Math.min(score, 35);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function suggestTracks(input: {
  seniority: Seniority;
  flexibility: Flexibility;
  salarySignal: SalarySignal;
  skills: SkillPartner[];
  contextExcerpt: string;
  title: string;
}): Track[] {
  const tracks: Track[] = [];
  const blob = `${input.title} ${input.contextExcerpt}`.toLowerCase();
  const senior =
    input.seniority !== "Other senior" ||
    input.salarySignal === "$100k+" ||
    input.salarySignal === "Fractional rate";

  const rigid =
    input.flexibility === "Rigid" ||
    /9[\s–-]5|must be in[- ]office|on[- ]site daily/.test(blob);

  if (rigid && !/async|flexible schedule|remote.?first/.test(blob)) {
    tracks.push("poor-fit");
  }

  if (
    senior &&
    /co[- ]?founder|vp|director|head of|cmo|cto|coo|ceo|replace|own the|lead marketing|growth lead/.test(
      blob
    )
  ) {
    tracks.push("hire-replacement");
  } else if (senior && input.salarySignal !== "Below $100k") {
    tracks.push("hire-replacement");
  }

  if (
    input.flexibility === "Flexible" ||
    /async|flexible|set your own|outcomes over hours|fractional|retainer/.test(
      blob
    )
  ) {
    tracks.push("flexible");
  }

  if (
    input.skills.some((s) => s === "Dev Shop" || s === "Creative & Deploy") ||
    /deploy|creative|asset|engineering|build|landing|funnel|integration/.test(
      blob
    )
  ) {
    tracks.push("build-creative");
  }

  if (tracks.length === 0) tracks.push("hire-replacement");
  return Array.from(new Set(tracks));
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
