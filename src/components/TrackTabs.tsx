"use client";

import type { TrackTab } from "@/lib/filters";
import { TRACK_TAB_LABELS } from "@/lib/labels";

interface TrackTabsProps {
  active: TrackTab;
  counts: Record<TrackTab, number>;
  onChange: (tab: TrackTab) => void;
}

const ORDER: TrackTab[] = [
  "all",
  "hire-replacement",
  "flexible",
  "build-creative",
  "poor-fit",
];

// A group of single-select filter buttons, not an ARIA tablist: every track
// filters the same card grid (there are no separate tab panels to point
// aria-controls at), so aria-pressed buttons are the correct pattern.
export function TrackTabs({ active, counts, onChange }: TrackTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter by track"
    >
      {ORDER.map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab)}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 ${
              isActive
                ? "border-ember/50 bg-ember/15 text-ember-soft shadow-ember"
                : "border-white/10 bg-ink-800 text-ink-200 hover:border-white/20 hover:text-chalk"
            }`}
          >
            {TRACK_TAB_LABELS[tab]}
            <span
              aria-hidden="true"
              className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                isActive ? "bg-ember/25 text-ember-soft" : "bg-ink-600 text-ink-300"
              }`}
            >
              {counts[tab]}
            </span>
            <span className="sr-only">
              , {counts[tab]} {counts[tab] === 1 ? "role" : "roles"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
