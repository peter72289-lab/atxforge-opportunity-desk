"use client";

interface HeaderProps {
  lastRefreshed: string;
  count: number;
}

export function Header({ lastRefreshed, count }: HeaderProps) {
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
          <span className="rounded-full border border-white/10 bg-ink-800 px-3 py-1.5 font-mono text-[11px] text-ink-200">
            Last refreshed · {lastRefreshed}
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
