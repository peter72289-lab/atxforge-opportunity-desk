"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Opportunity, OpportunityStatus } from "@/data/types";
import { FLEX_STYLES, TRACK_LABELS, scoreTone } from "@/lib/labels";

const STATUS_PILL: Record<OpportunityStatus, string> = {
  New: "border-white/10 bg-ink-700 text-ink-200",
  Reviewing: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  Outreach: "border-ember/30 bg-ember/10 text-ember-soft",
  Won: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  Lost: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  Skipped: "border-white/10 bg-ink-900/80 text-ink-300",
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  onOpen: (id: string) => void;
}

export function OpportunityCard({
  opportunity: o,
  index,
  onOpen,
}: OpportunityCardProps) {
  const reduce = useReducedMotion();
  const flex = FLEX_STYLES[o.flexibility];

  return (
    <motion.article
      layout
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.35 }}
      className="group flex flex-col rounded-xl border border-white/8 bg-ink-800/90 p-4 shadow-card transition hover:border-ember/35 hover:shadow-ember focus-within:border-ember/35"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-ember/30 bg-ember/10 px-2 py-0.5 text-[11px] font-semibold text-ember-soft">
            {o.seniority}
          </span>
          {o.tracks.slice(0, 2).map((t) => (
            <span
              key={t}
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                t === "poor-fit"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  : "border-white/10 bg-ink-700 text-ink-200"
              }`}
            >
              {TRACK_LABELS[t]}
            </span>
          ))}
        </div>
        <div className="text-right">
          <p className={`font-display text-lg font-bold ${scoreTone(o.score)}`}>
            {o.score}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-ink-400">
            Forge
          </p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm text-ink-200">
          <span className="font-semibold text-chalk">{o.org}</span>
          <span className="text-ink-400"> · </span>
          <span>{o.industry}</span>
        </p>
        <h3 className="mt-1 font-display text-lg font-bold leading-snug text-chalk">
          {o.title}
        </h3>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-md border border-white/10 bg-ink-900/80 px-2 py-0.5 text-[11px] text-ink-200">
          {o.salarySignal}
        </span>
        <span
          className={`rounded-md border px-2 py-0.5 text-[11px] ${flex.className}`}
        >
          {flex.label}
        </span>
        {o.sample && (
          <span className="rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200">
            Research sample
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {o.skills.map((s) => (
          <span
            key={s}
            className="rounded-full bg-ink-700 px-2 py-0.5 text-[10px] text-ink-100"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-3 mt-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs text-ink-300">
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_PILL[o.status]}`}
            >
              <span className="sr-only">Status: </span>
              {o.status}
            </span>
            <span className="truncate">{o.sourceName}</span>
          </p>
          <p className="font-mono text-[10px] text-ink-400">Seen {o.seenAt}</p>
        </div>
        <button
          type="button"
          onClick={() => onOpen(o.id)}
          aria-label={`Open dossier: ${o.title}, ${o.org}`}
          className="shrink-0 rounded-full bg-ember px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:bg-ember-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chalk focus-visible:ring-offset-2 focus-visible:ring-offset-ink-800"
        >
          Open dossier
        </button>
      </div>
    </motion.article>
  );
}
