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

export function TrackTabs({ active, counts, onChange }: TrackTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Opportunity tracks"
    >
      {ORDER.map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
              isActive
                ? "border-ember/50 bg-ember/15 text-ember-soft shadow-ember"
                : "border-white/10 bg-ink-800 text-ink-200 hover:border-white/20 hover:text-chalk"
            }`}
          >
            {TRACK_TAB_LABELS[tab]}
            <span
              className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                isActive ? "bg-ember/25 text-ember-soft" : "bg-ink-600 text-ink-300"
              }`}
            >
              {counts[tab]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
