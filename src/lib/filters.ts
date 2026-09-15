import type {
  Flexibility,
  Opportunity,
  SalarySignal,
  Seniority,
  SkillPartner,
  SourceType,
  Track,
} from "@/data/types";

export type TrackTab =
  | "all"
  | "hire-replacement"
  | "flexible"
  | "build-creative"
  | "poor-fit";

export interface FilterState {
  query: string;
  seniority: Seniority | "All";
  salarySignal: SalarySignal | "All";
  flexibility: Flexibility | "All";
  industry: string[];
  skills: SkillPartner[];
  sourceType: SourceType | "All";
}

export const defaultFilters: FilterState = {
  query: "",
  seniority: "All",
  salarySignal: "All",
  flexibility: "All",
  industry: [],
  skills: [],
  sourceType: "All",
};

export function trackFromHash(hash: string): TrackTab {
  const h = hash.replace(/^#/, "").toLowerCase();
  if (
    h === "hire-replacement" ||
    h === "flexible" ||
    h === "build-creative" ||
    h === "poor-fit"
  ) {
    return h;
  }
  return "all";
}

export function filterOpportunities(
  items: Opportunity[],
  tab: TrackTab,
  filters: FilterState
): Opportunity[] {
  const q = filters.query.trim().toLowerCase();

  return items
    .filter((o) => {
      if (tab !== "all" && !o.tracks.includes(tab as Track)) return false;

      if (filters.seniority !== "All" && o.seniority !== filters.seniority)
        return false;
      if (
        filters.salarySignal !== "All" &&
        o.salarySignal !== filters.salarySignal
      )
        return false;
      if (
        filters.flexibility !== "All" &&
        o.flexibility !== filters.flexibility
      )
        return false;
      if (
        filters.sourceType !== "All" &&
        o.sourceType !== filters.sourceType
      )
        return false;

      if (
        filters.industry.length > 0 &&
        !filters.industry.some((ind) =>
          o.industry.toLowerCase().includes(ind.toLowerCase())
        )
      )
        return false;

      if (
        filters.skills.length > 0 &&
        !filters.skills.some((s) => o.skills.includes(s))
      )
        return false;

      if (q) {
        const hay = [
          o.title,
          o.org,
          o.industry,
          o.sourceName,
          o.community,
          o.contextExcerpt,
          o.whyForge,
          ...o.skills,
          ...o.tracks,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    })
    .sort((a, b) => b.score - a.score);
}

export function uniqueIndustries(items: Opportunity[]): string[] {
  return Array.from(new Set(items.map((o) => o.industry))).sort();
}

export function countByTab(items: Opportunity[]): Record<TrackTab, number> {
  return {
    all: items.length,
    "hire-replacement": items.filter((o) =>
      o.tracks.includes("hire-replacement")
    ).length,
    flexible: items.filter((o) => o.tracks.includes("flexible")).length,
    "build-creative": items.filter((o) =>
      o.tracks.includes("build-creative")
    ).length,
    "poor-fit": items.filter((o) => o.tracks.includes("poor-fit")).length,
  };
}
