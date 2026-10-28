/**
 * Team roster: the people and capability lanes the desk can staff.
 *
 * To add someone, append one entry below. `id` is the value stored on
 * opportunities (skills / recommendedPartners), `label` is the short chip
 * text, and `lens` is what they cover. SkillPartner, the skill filter and
 * the labels all derive from this list. Renaming an id breaks seed rows
 * and the literal ids in src/lib/scoring.ts ("Dev Shop", "Creative &
 * Deploy"); the type check will flag them.
 *
 * Staffing only. A per-opportunity owner (one accountable person) is a
 * separate, later step in the roadmap.
 */
export type TeamMemberKind = "person" | "capability";

export const TEAM = [
  {
    id: "Peter",
    label: "Peter · Offer / CMO",
    kind: "person",
    lens: "Offer / mechanisms / language / CMO-shaped leadership",
  },
  {
    id: "Wilson",
    label: "Wilson · Systems",
    kind: "person",
    lens: "Systems / integrations / vibe-coding → wiring",
  },
  {
    id: "Matthew",
    label: "Matthew · Architecture",
    kind: "person",
    lens: "Architecture, deployment, delivery",
  },
  {
    id: "Dev Shop",
    label: "Dev Shop · Eng",
    kind: "capability",
    lens: "Real production engineering",
  },
  {
    id: "Creative & Deploy",
    label: "Creative & Deploy",
    kind: "capability",
    lens: "Creative production, assets, launch execution",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  kind: TeamMemberKind;
  lens: string;
}>;

export type TeamMember = (typeof TEAM)[number];
export type TeamMemberId = TeamMember["id"];

export const TEAM_IDS: TeamMemberId[] = TEAM.map((m) => m.id);
