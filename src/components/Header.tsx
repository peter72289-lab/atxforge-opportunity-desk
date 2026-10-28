"use client";

import { useEffect, useState } from "react";

// ROADMAP Stage 1 step 8: amber after 7 days, red after 14.
const AMBER_AFTER_DAYS = 7;
const RED_AFTER_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days between an ISO date (YYYY-MM-DD, read as UTC) and now. */
function daysSince(isoDate: string, now: number): number | null {
  const then = Date.parse(isoDate);
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((now - then) / DAY_MS));
}

function ageLabel(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function ageClass(days: number | null): string {
  if (days !== null && days > RED_AFTER_DAYS) {
    return "border-red-500/40 bg-red-500/10 text-red-300";
  }
  if (days !== null && days > AMBER_AFTER_DAYS) {
    return "border-amber-400/40 bg-amber-400/10 text-amber-200";
  }
  return "border-white/10 bg-ink-800 text-ink-200";
}

interface HeaderProps {
  lastRefreshed: string;
  count: number;
}

export function Header({ lastRefreshed, count }: HeaderProps) {
  // "Now" is read after mount so the server render and first client render
  // agree; until then the chip shows the raw date.
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    setDays(daysSince(lastRefreshed, Date.now()));
  }, [lastRefreshed]);

  return (
    <header className="border-b border-white/5 bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ember font-display text-sm font-extrabold text-ink shadow-ember">
            AF
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember-soft">
              ATXFORGE · Research desk
            </p>
            <h1 className="font-display text-xl font-bold tracking-tight text-chalk sm:text-2xl">
              Opportunity Desk
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] ${ageClass(days)}`}
            title={`Last updated ${lastRefreshed}`}
          >
            {days === null
              ? `Sample data, last updated ${lastRefreshed}`
              : `Sample data, last updated ${ageLabel(days)}`}
          </span>
          <span className="rounded-full border border-ember/30 bg-ember/10 px-3 py-1.5 font-mono text-[11px] text-ember-soft">
            {count} dossiers
          </span>
          <a
            href="http://localhost:3000"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-800 px-3 py-1.5 text-xs font-medium text-ink-100 transition hover:border-ember/40 hover:text-chalk"
            title="Marketing site (dev :3000)"
          >
            ← Marketing site
          </a>
        </div>
      </div>
    </header>
  );
}
