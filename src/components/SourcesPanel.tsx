"use client";

import type { WatchSource } from "@/data/types";

interface SourcesPanelProps {
  sources: WatchSource[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  return (
    <section
      id="sources"
      className="rounded-xl border border-white/8 bg-ink-800/50 p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember-soft">
            Start with these sources
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-chalk">
            Watch list
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-ink-300">
          Activity is evidence of posting, not a promise of open roles. Seed
          dossiers below are research samples — not live Slack scrapes.
        </p>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {sources.map((s) => (
          <li
            key={s.id}
            className="rounded-lg border border-white/8 bg-ink-900/60 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-chalk hover:text-ember-soft"
              >
                {s.name} ↗
              </a>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-ink-300">
                {s.type}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-300">{s.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
