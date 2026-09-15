import type { WatchSource } from "./types";

/**
 * Watch sources — activity on these boards/communities is evidence of posting,
 * not a guarantee of an open role. Curated for ATXFORGE desk research.
 */
export const watchSources: WatchSource[] = [
  {
    id: "src-fractionaljobs",
    name: "Fractional Jobs",
    type: "Job board",
    url: "https://www.fractionaljobs.io/",
    note: "Senior fractional / retainer leadership roles across industries. High density of hire-replacement shapes.",
  },
  {
    id: "src-wellfound",
    name: "Wellfound (AngelList)",
    type: "Job board",
    url: "https://wellfound.com/",
    note: "Startup roles; filter for Head/Director/VP and remote-first language.",
  },
  {
    id: "src-ycombinator",
    name: "Y Combinator Work at a Startup",
    type: "Job board",
    url: "https://www.ycombinator.com/jobs",
    note: "Early-stage co-founder-adjacent and first-hire GTM / eng leadership.",
  },
  {
    id: "src-linkedin",
    name: "LinkedIn Jobs / Posts",
    type: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
    note: "Public posts from founders hiring one senior marketer/operator. Manual triage recommended.",
  },
  {
    id: "src-indiehackers",
    name: "Indie Hackers",
    type: "Slack/Discord/community",
    url: "https://www.indiehackers.com/",
    note: "Community posts seeking build partners, fractional GTM, and async collaboration.",
  },
  {
    id: "src-ondeck",
    name: "On Deck / founder communities",
    type: "Slack/Discord/community",
    url: "https://www.beondeck.com/",
    note: "Slack/community channels where founders ask for operators who ship, not clock-watchers.",
  },
  {
    id: "src-remoteok",
    name: "Remote OK",
    type: "Job board",
    url: "https://remoteok.com/",
    note: "Remote listings; watch for flexible vs rigid timezone theater.",
  },
  {
    id: "src-weworkremotely",
    name: "We Work Remotely",
    type: "Job board",
    url: "https://weworkremotely.com/",
    note: "Remote exec and specialist roles; flag must-be-online-9–5-ET patterns.",
  },
  {
    id: "src-contra",
    name: "Contra",
    type: "Job board",
    url: "https://contra.com/",
    note: "Independent / project-based work — often flexible forge fits with clear outcomes.",
  },
  {
    id: "src-producthunt",
    name: "Product Hunt Maker community",
    type: "Slack/Discord/community",
    url: "https://www.producthunt.com/",
    note: "Launch + build needs; creative/deploy and real engineering asks surface here.",
  },
];
