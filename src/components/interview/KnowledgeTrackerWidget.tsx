"use client";

import React from "react";
import { CheckCircle2, AlertCircle, CircleDashed } from "lucide-react";
import { NeonBadge } from "../common/NeonBadge";

export interface SkillTrackerItem {
  name: string;
  depth: number | null; // 1-5
  status: "NOT_VERIFIED" | "PARTIALLY_VERIFIED" | "VERIFIED" | "CONTRADICTED";
  importance: string;
}

interface KnowledgeTrackerWidgetProps {
  skills: SkillTrackerItem[];
  currentTurn: number;
  maxTurns: number;
}

export function KnowledgeTrackerWidget({
  skills,
  currentTurn,
  maxTurns,
}: KnowledgeTrackerWidgetProps) {
  const verifiedCount = skills.filter((s) => s.status === "VERIFIED").length;
  const progressPercent = Math.min(100, Math.round((currentTurn / maxTurns) * 100));

  return (
    <div className="flex flex-col h-full bg-obsidian-900/90 rounded-2xl border border-white/10 p-5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Live Knowledge Radar
          </h3>
          <p className="text-sm font-semibold text-white">
            {verifiedCount} of {skills.length} Skills Verified
          </p>
        </div>
        <NeonBadge
          label={`Turn ${currentTurn}/${maxTurns}`}
          variant="cyan"
          size="sm"
        />
      </div>

      {/* Progress Bar */}
      <div className="py-3 border-b border-white/5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span>Interview Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-obsidian-950 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-violet transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Skill List */}
      <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 pr-1">
        {skills.map((skill) => {
          const isVerified = skill.status === "VERIFIED";
          const isPartial = skill.status === "PARTIALLY_VERIFIED";

          return (
            <div
              key={skill.name}
              className={`p-3 rounded-xl border transition-all ${
                isVerified
                  ? "bg-cyber-emerald/5 border-cyber-emerald/20"
                  : isPartial
                  ? "bg-cyber-amber/5 border-cyber-amber/20"
                  : "bg-obsidian-950/40 border-white/5 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-cyber-emerald" />
                  ) : isPartial ? (
                    <AlertCircle className="w-4 h-4 text-cyber-amber" />
                  ) : (
                    <CircleDashed className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="text-xs font-medium text-slate-200">{skill.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Depth Meter 1 to 5 */}
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`w-1.5 h-3 rounded-xs ${
                        skill.depth && skill.depth >= lvl
                          ? "bg-cyber-cyan shadow-[0_0_5px_#06B6D4]"
                          : "bg-slate-800"
                      }`}
                      title={`Level ${lvl}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
