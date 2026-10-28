"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Opportunity, OpportunityStatus } from "@/data/types";
import {
  FLEX_STYLES,
  SKILL_LABELS,
  STATUS_OPTIONS,
  TRACK_LABELS,
  scoreTone,
} from "@/lib/labels";

const PLACEHOLDER_SCREENSHOT = "/screenshots/placeholder-dossier.svg";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DossierDrawerProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onStatusChange: (id: string, status: OpportunityStatus) => void;
}

export function DossierDrawer({
  opportunity: o,
  onClose,
  onStatusChange,
}: DossierDrawerProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  // Parent passes a new onClose each render; keep the latest without
  // re-running the open/close effect (which would steal focus back).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isOpen = o !== null;

  useEffect(() => {
    if (!isOpen) return;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      // Keep Tab / Shift+Tab inside the drawer while it is open.
      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      );
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const current = document.activeElement;
      const inside = panelRef.current.contains(current);
      // The panel itself holds focus right after opening; Shift+Tab from it
      // would otherwise leave the dialog.
      const atStart = current === first || current === panelRef.current;
      if (e.shiftKey && (atStart || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      if (opener && opener.isConnected) opener.focus();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {o && (
        <>
          {/* Backdrop: mouse/touch dismiss only; keyboard uses Esc or the close button. */}
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dossier-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-white/10 bg-ink-900 shadow-drawer outline-none"
            initial={reduce ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/8 px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember-soft">
                  Dossier
                </p>
                <h2
                  id="dossier-title"
                  className="mt-1 font-display text-xl font-bold text-chalk"
                >
                  {o.title}
                </h2>
                <p className="mt-1 text-sm text-ink-200">
                  {o.org} · {o.industry}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dossier"
                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-sm text-ink-200 hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                Esc
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`font-display text-2xl font-bold ${scoreTone(o.score)}`}
                >
                  {o.score}
                  <span className="ml-1 font-mono text-xs font-normal text-ink-400">
                    forge
                  </span>
                </span>
                <span className="rounded-full border border-ember/30 bg-ember/10 px-2 py-0.5 text-xs text-ember-soft">
                  {o.seniority}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs ${FLEX_STYLES[o.flexibility].className}`}
                >
                  {o.flexibility}
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-ink-200">
                  {o.salarySignal}
                </span>
                {o.sample && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200">
                    Research sample
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {o.tracks.map((t) => (
                  <span
                    key={t}
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      t === "poor-fit"
                        ? "border-rose-500/30 text-rose-300"
                        : "border-white/10 text-ink-200"
                    }`}
                  >
                    {TRACK_LABELS[t]}
                  </span>
                ))}
              </div>

              <section>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
                  Source excerpt
                </h3>
                {/* Not wrapped in quote marks: excerpts are often paraphrased. */}
                <p className="mt-2 rounded-lg border border-ember/20 bg-ember/5 px-4 py-3 text-sm leading-relaxed text-ink-100">
                  {o.contextExcerpt}
                </p>
              </section>

              <section>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
                  Why it fits ATXFORGE
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-100">
                  {o.whyForge}
                </p>
              </section>

              <section>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
                  Recommended partners
                </h3>
                {o.recommendedPartners.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-400">
                    None — flagged poor fit / skip.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {o.recommendedPartners.map((p) => (
                      <li
                        key={p}
                        className="rounded-lg border border-ember/25 bg-ember/10 px-3 py-1.5 text-sm text-ember-soft"
                      >
                        {SKILL_LABELS[p]}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Hidden until a real capture exists; the placeholder implied one. */}
              {o.screenshotPath &&
                o.screenshotPath !== PLACEHOLDER_SCREENSHOT && (
                  <section>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
                      Screenshot
                    </h3>
                    <div className="relative mt-2 aspect-video overflow-hidden rounded-lg border border-white/10 bg-ink-800">
                      <Image
                        src={o.screenshotPath}
                        alt={`Screenshot of the listing for ${o.title}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </section>
                )}

              <section className="space-y-2">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
                  Deep link & community
                </h3>
                <p className="text-sm text-ink-200">
                  <span className="text-ink-400">Channel · </span>
                  {o.community}
                </p>
                <p className="text-sm text-ink-200">
                  <span className="text-ink-400">Source · </span>
                  {o.sourceName} ({o.sourceType})
                </p>
                <a
                  href={o.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-ember px-4 py-2 text-sm font-semibold text-ink shadow-ember transition hover:bg-ember-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chalk focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
                >
                  Open listing / thread ↗
                </a>
              </section>

              <section>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
                  Fit / risk notes
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-100">
                  {o.fitNotes}
                </p>
              </section>

              <section>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
                  Status workflow
                </h3>
                <div
                  role="group"
                  aria-label="Status"
                  className="mt-2 flex flex-wrap gap-1.5"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={o.status === s}
                      onClick={() => onStatusChange(o.id, s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember ${
                        o.status === s
                          ? "border-ember/50 bg-ember/20 text-ember-soft"
                          : "border-white/10 text-ink-300 hover:text-chalk"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-2 font-mono text-[10px] text-ink-500">
                  Status is local to this session (v1 · no backend).
                </p>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
