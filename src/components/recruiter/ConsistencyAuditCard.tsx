"use client";

import React from "react";
import { GitCompare, CheckCircle2, AlertTriangle } from "lucide-react";
import { NeonBadge } from "../common/NeonBadge";

interface ConsistencyAuditCardProps {
  consistencyRating: "HIGH" | "MODERATE" | "LOW";
  inconsistencies: string[];
  rephraseScore: "HIGH" | "MODERATE" | "FRAGILE";
}

export function ConsistencyAuditCard({
  consistencyRating,
  inconsistencies,
  rephraseScore,
}: ConsistencyAuditCardProps) {
  const isHigh = consistencyRating === "HIGH";

  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-obsidian-900/70 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyber-violet/10 border border-cyber-violet/30 flex items-center justify-center">
            <GitCompare className="w-4 h-4 text-cyber-violet" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Cross-Question Consistency & Reasoning
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Temporal contradiction and rephrasing resilience monitor
            </p>
          </div>
        </div>
        <NeonBadge
          label={`${consistencyRating} CONSISTENCY`}
          variant={isHigh ? "emerald" : "amber"}
          size="sm"
          dot
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-obsidian-950/60 border border-white/5 space-y-1.5">
          <span className="text-slate-400">Rephrase & Counterfactual Survival</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyber-emerald" />
            <span className="text-slate-100 font-semibold">{rephraseScore} RESILIENCE</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Candidate maintained internal logical coherence when probed with failure modes.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-950/60 border border-white/5 space-y-1.5">
          <span className="text-slate-400">Contradictions Flagged</span>
          <div className="flex items-center gap-2">
            {inconsistencies.length === 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-cyber-emerald" />
                <span className="text-emerald-400 font-semibold">0 DISCREPANCIES DETECTED</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-cyber-amber" />
                <span className="text-amber-400 font-semibold">{inconsistencies.length} OBSERVATION(S)</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Claims were compared across questions $Q_1 \dots Q_N$.
          </p>
        </div>
      </div>

      {inconsistencies.length > 0 && (
        <div className="p-4 rounded-xl bg-cyber-amber/5 border border-cyber-amber/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            Transparent Observation Notes
          </div>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-sans">
            {inconsistencies.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
