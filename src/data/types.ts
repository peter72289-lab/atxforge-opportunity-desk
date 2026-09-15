/** ATXFORGE Opportunity Desk — ingest schema for scrapers & manual dossiers */

export type Track =
  | "hire-replacement"
  | "flexible"
  | "build-creative"
  | "poor-fit";

export type Seniority =
  | "Co-founder"
  | "C-level"
  | "VP"
  | "Director"
  | "Head"
  | "Other senior";

export type SalarySignal =
  | "$100k+"
  | "Fractional rate"
  | "Undisclosed"
  | "Below $100k";

export type Flexibility = "Flexible" | "Rigid" | "Unknown";

export type SkillPartner =
  | "Peter"
  | "Wilson"
  | "Dev Shop"
  | "Creative & Deploy";

export type SourceType =
  | "Job board"
  | "Slack/Discord/community"
  | "LinkedIn"
  | "Other";

export type OpportunityStatus =
  | "New"
  | "Reviewing"
  | "Outreach"
  | "Won"
  | "Lost"
  | "Skipped";

export interface Opportunity {
  id: string;
  title: string;
  org: string;
  tracks: Track[];
  seniority: Seniority;
  salarySignal: SalarySignal;
  flexibility: Flexibility;
  industry: string;
  skills: SkillPartner[];
  /** Forge score 0–100; may be precomputed or derived via scoreOpportunity() */
  score: number;
  sourceName: string;
  sourceType: SourceType;
  /** Deep link to the exact listing / thread */
  sourceUrl: string;
  community: string;
  /** Exact post language that triggered the flag */
  contextExcerpt: string;
  /** Hire-replacement angle + multi-skill coverage */
  whyForge: string;
  /** Recommended partners to staff (subset of skills or freeform) */
  recommendedPartners: SkillPartner[];
  /** Fit / risk notes */
  fitNotes: string;
  screenshotPath?: string;
  status: OpportunityStatus;
  seenAt: string; // ISO date
  /** Honest labeling — seeded research samples are not live scrapes */
  sample: boolean;
}

export interface WatchSource {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  note: string;
}
