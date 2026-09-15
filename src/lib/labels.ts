import type {
  Flexibility,
  OpportunityStatus,
  SkillPartner,
  Track,
} from "@/data/types";

export const TRACK_LABELS: Record<Track, string> = {
  "hire-replacement": "Hire Replacement",
  flexible: "Flexible Forge Fit",
  "build-creative": "Build / Creative",
  "poor-fit": "Poor Fit",
};

export const TRACK_TAB_LABELS = {
  all: "All",
  "hire-replacement": "Hire Replacement",
  flexible: "Flexible",
  "build-creative": "Build / Creative",
  "poor-fit": "Poor Fit",
} as const;

export const SKILL_LABELS: Record<SkillPartner, string> = {
  Peter: "Peter · Offer / CMO",
  Wilson: "Wilson · Systems",
  "Dev Shop": "Dev Shop · Eng",
  "Creative & Deploy": "Creative & Deploy",
};

export const FLEX_STYLES: Record<
  Flexibility,
  { className: string; label: string }
> = {
  Flexible: {
    label: "Flexible",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  Rigid: {
    label: "Rigid",
    className: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  Unknown: {
    label: "Unknown",
    className: "bg-ink-500/40 text-ink-200 border-white/10",
  },
};

export const STATUS_OPTIONS: OpportunityStatus[] = [
  "New",
  "Reviewing",
  "Outreach",
  "Won",
  "Lost",
  "Skipped",
];

export function scoreTone(score: number): string {
  if (score >= 75) return "text-ember-soft";
  if (score >= 55) return "text-amber-300";
  if (score >= 40) return "text-ink-200";
  return "text-rose-300";
}
