"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LAST_REFRESHED,
  opportunities as seedOpportunities,
} from "@/data/opportunities";
import { watchSources } from "@/data/sources";
import type { Opportunity, OpportunityStatus } from "@/data/types";
import {
  countByTab,
  defaultFilters,
  filterOpportunities,
  trackFromHash,
  uniqueIndustries,
  type FilterState,
  type TrackTab,
} from "@/lib/filters";
import { DossierDrawer } from "./DossierDrawer";
import { Filters } from "./Filters";
import { Header } from "./Header";
import { OpportunityCard } from "./OpportunityCard";
import { SourcesPanel } from "./SourcesPanel";
import { StatsRow } from "./StatsRow";
import { TrackTabs } from "./TrackTabs";
import { ValueStrip } from "./ValueStrip";

export function DeskApp() {
  const [items, setItems] = useState<Opportunity[]>(seedOpportunities);
  const [tab, setTab] = useState<TrackTab>("all");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const apply = () => setTab(trackFromHash(window.location.hash));
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const setTabAndHash = useCallback((next: TrackTab) => {
    setTab(next);
    const hash = next === "all" ? "all" : next;
    if (window.location.hash !== `#${hash}`) {
      window.history.replaceState(null, "", `#${hash}`);
    }
  }, []);

  const counts = useMemo(() => countByTab(items), [items]);
  const industries = useMemo(() => uniqueIndustries(items), [items]);
  const filtered = useMemo(
    () => filterOpportunities(items, tab, filters),
    [items, tab, filters]
  );
  const active = useMemo(
    () => items.find((o) => o.id === activeId) ?? null,
    [items, activeId]
  );

  const onStatusChange = useCallback((id: string, status: OpportunityStatus) => {
    setItems((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }, []);

  return (
    <div className="min-h-screen bg-ink text-chalk">
      <Header lastRefreshed={LAST_REFRESHED} count={items.length} />
      <ValueStrip />

      <main className="relative mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade opacity-30"
          style={{ backgroundSize: "48px 48px" }}
          aria-hidden
        />

        <div className="mb-8 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember-soft">
            Senior opportunity feed · any industry
          </p>
          <h2 className="max-w-3xl font-display text-3xl font-extrabold tracking-tight text-chalk sm:text-4xl">
            Opportunities where a microagency{" "}
            <span className="text-gradient-ember">replaces one FTE</span>
            —or lands flexible build work.
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-300 sm:text-base">
            Curated hire-replacement seats (Co-founder / VP / Director / Head /
            $100k+) and flexible forge fits across SaaS, CPG, health, fintech,
            creator, industrial, and more. Not marketing-only.
          </p>
        </div>

        <StatsRow
          opportunities={items.length}
          sources={watchSources.length}
          hireReplacement={counts["hire-replacement"]}
          flexible={counts.flexible}
        />

        <div className="mt-10 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
                Tracks · hash routes
              </p>
              <h3 className="font-display text-xl font-bold text-chalk">
                Desk feed
              </h3>
            </div>
            <p className="font-mono text-[10px] text-ink-400">
              #all · #hire-replacement · #flexible · #build-creative · #poor-fit
            </p>
          </div>

          <TrackTabs
            active={tab}
            counts={counts}
            onChange={setTabAndHash}
          />

          <Filters
            filters={filters}
            industries={industries}
            resultCount={filtered.length}
            onChange={setFilters}
          />

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-ink-800/40 px-6 py-16 text-center">
              <p className="font-display text-lg text-chalk">No matches</p>
              <p className="mt-2 text-sm text-ink-300">
                Reset filters or switch tracks.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((o, i) => (
                <OpportunityCard
                  key={o.id}
                  opportunity={o}
                  index={i}
                  onOpen={setActiveId}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-14">
          <SourcesPanel sources={watchSources} />
        </div>

        <footer className="mt-12 border-t border-white/5 py-8 text-center text-xs text-ink-400">
          ATXFORGE Opportunity Desk v1 · seed data marked as research samples ·
          scoring rules in SCORING.md
        </footer>
      </main>

      <DossierDrawer
        opportunity={active}
        onClose={() => setActiveId(null)}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}
