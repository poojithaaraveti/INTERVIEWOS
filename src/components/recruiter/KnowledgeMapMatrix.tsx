"use client";

import React from "react";
import { ShieldCheck, HelpCircle } from "lucide-react";
import { NeonBadge } from "../common/NeonBadge";

export interface RecruiterSkillItem {
  name: string;
  category: string;
  claimedLevel: string;
  verifiedDepth: number; // 0 to 5
  coverageStatus: "NOT_VERIFIED" | "PARTIALLY_VERIFIED" | "VERIFIED" | "CONTRADICTED";
  evidenceQuotes: string[];
}

interface KnowledgeMapMatrixProps {
  skills: RecruiterSkillItem[];
}

export function KnowledgeMapMatrix({ skills }: KnowledgeMapMatrixProps) {
  const depthLabels: Record<number, string> = {
    0: "Unverified",
    1: "Awareness",
    2: "Fundamentals",
    3: "Practical Application",
    4: "Problem Solving",
    5: "Deep Architecture",
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-obsidian-900/60 backdrop-blur-xl">
      <table className="w-full text-left text-xs font-mono">
        <thead className="bg-obsidian-950/80 border-b border-white/10 text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="py-3.5 px-4 font-semibold">Skill / Competency</th>
            <th className="py-3.5 px-4 font-semibold">Claimed</th>
            <th className="py-3.5 px-4 font-semibold">Verified Depth (1-5)</th>
            <th className="py-3.5 px-4 font-semibold">Status</th>
            <th className="py-3.5 px-4 font-semibold">Supporting Spoken Evidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {skills.map((skill) => (
            <tr key={skill.name} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
                {skill.name}
              </td>
              <td className="py-3.5 px-4 text-slate-400 capitalize">
                {skill.claimedLevel}
              </td>
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`w-2.5 h-3.5 rounded-xs ${
                          skill.verifiedDepth >= lvl
                            ? "bg-cyber-cyan shadow-[0_0_8px_#06B6D4]"
                            : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-300">
                    {depthLabels[skill.verifiedDepth]}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-4">
                {skill.coverageStatus === "VERIFIED" ? (
                  <NeonBadge label="VERIFIED" variant="emerald" size="sm" dot />
                ) : skill.coverageStatus === "PARTIALLY_VERIFIED" ? (
                  <NeonBadge label="PARTIAL" variant="amber" size="sm" dot />
                ) : (
                  <NeonBadge label="UNEXPLORED" variant="obsidian" size="sm" />
                )}
              </td>
              <td className="py-3.5 px-4 text-slate-300 max-w-md font-sans text-xs">
                {skill.evidenceQuotes.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {skill.evidenceQuotes.map((quote, idx) => (
                      <li key={idx} className="truncate" title={quote}>
                        &ldquo;{quote}&rdquo;
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-500 italic">No direct spoken evidence gathered</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
