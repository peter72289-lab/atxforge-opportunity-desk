"use client";

import type {
  Flexibility,
  SalarySignal,
  Seniority,
  SkillPartner,
  SourceType,
} from "@/data/types";
import type { FilterState } from "@/lib/filters";
import { defaultFilters } from "@/lib/filters";

interface FiltersProps {
  filters: FilterState;
  industries: string[];
  resultCount: number;
  onChange: (next: FilterState) => void;
}

const SENIORITY: Array<Seniority | "All"> = [
  "All",
  "Co-founder",
  "C-level",
  "VP",
  "Director",
  "Head",
  "Other senior",
];

const SALARY: Array<SalarySignal | "All"> = [
  "All",
  "$100k+",
  "Fractional rate",
  "Undisclosed",
  "Below $100k",
];

const FLEX: Array<Flexibility | "All"> = [
  "All",
  "Flexible",
  "Rigid",
  "Unknown",
];

const SKILLS: SkillPartner[] = [
  "Peter",
  "Wilson",
  "Dev Shop",
  "Creative & Deploy",
];

const SOURCES: Array<SourceType | "All"> = [
  "All",
  "Job board",
  "Slack/Discord/community",
  "LinkedIn",
  "Other",
];

const selectClass =
  "rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-chalk outline-none focus:border-ember/50 focus:ring-1 focus:ring-ember/40";

export function Filters({
  filters,
  industries,
  resultCount,
  onChange,
}: FiltersProps) {
  const toggleIndustry = (ind: string) => {
    const set = new Set(filters.industry);
    if (set.has(ind)) set.delete(ind);
    else set.add(ind);
    onChange({ ...filters, industry: Array.from(set) });
  };

  const toggleSkill = (skill: SkillPartner) => {
    const set = new Set(filters.skills);
    if (set.has(skill)) set.delete(skill);
    else set.add(skill);
    onChange({ ...filters, skills: Array.from(set) });
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/8 bg-ink-800/60 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          type="search"
          placeholder="Search company, role, skill, or industry…"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="w-full flex-1 rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-chalk placeholder:text-ink-400 outline-none focus:border-ember/50 focus:ring-1 focus:ring-ember/40"
        />
        <div className="flex flex-wrap gap-2">
          <select
            className={selectClass}
            value={filters.seniority}
            onChange={(e) =>
              onChange({
                ...filters,
                seniority: e.target.value as FilterState["seniority"],
              })
            }
            aria-label="Seniority"
          >
            {SENIORITY.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All seniority" : s}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={filters.salarySignal}
            onChange={(e) =>
              onChange({
                ...filters,
                salarySignal: e.target.value as FilterState["salarySignal"],
              })
            }
            aria-label="Salary signal"
          >
            {SALARY.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "Any pay signal" : s}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={filters.flexibility}
            onChange={(e) =>
              onChange({
                ...filters,
                flexibility: e.target.value as FilterState["flexibility"],
              })
            }
            aria-label="Flexibility"
          >
            {FLEX.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "Any flexibility" : s}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={filters.sourceType}
            onChange={(e) =>
              onChange({
                ...filters,
                sourceType: e.target.value as FilterState["sourceType"],
              })
            }
            aria-label="Source type"
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All source types" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
            Skill fit
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SKILLS.map((s) => {
              const on = filters.skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition ${
                    on
                      ? "border-ember/40 bg-ember/15 text-ember-soft"
                      : "border-white/10 text-ink-300 hover:text-chalk"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 sm:max-w-md sm:text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
            Industry (multi-select · not restricted)
          </p>
          <div className="flex flex-wrap gap-1.5 sm:justify-end">
            {industries.map((ind) => {
              const on = filters.industry.includes(ind);
              return (
                <button
                  key={ind}
                  type="button"
                  onClick={() => toggleIndustry(ind)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition ${
                    on
                      ? "border-ember/40 bg-ember/15 text-ember-soft"
                      : "border-white/10 text-ink-300 hover:text-chalk"
                  }`}
                >
                  {ind}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <button
          type="button"
          onClick={() => onChange(defaultFilters)}
          className="text-xs font-medium text-ink-300 underline-offset-2 hover:text-ember-soft hover:underline"
        >
          Reset filters
        </button>
        <p className="font-mono text-[11px] text-ink-300">
          {resultCount} opportunit{resultCount === 1 ? "y" : "ies"}
        </p>
      </div>
    </div>
  );
}
