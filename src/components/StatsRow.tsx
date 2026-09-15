"use client";

import { motion, useReducedMotion } from "framer-motion";

interface StatsRowProps {
  opportunities: number;
  sources: number;
  hireReplacement: number;
  flexible: number;
}

export function StatsRow({
  opportunities,
  sources,
  hireReplacement,
  flexible,
}: StatsRowProps) {
  const reduce = useReducedMotion();
  const stats = [
    { label: "Seed dossiers", value: opportunities },
    { label: "Watch sources", value: sources },
    { label: "Hire replacement", value: hireReplacement },
    { label: "Flexible fits", value: flexible },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.35 }}
          className="rounded-xl border border-white/8 bg-ink-800/80 px-4 py-4 shadow-card"
        >
          <p className="font-display text-3xl font-bold text-chalk">{s.value}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
            {s.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
