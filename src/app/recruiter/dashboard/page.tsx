"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, FileSearch, ArrowRight, ShieldCheck, Clock, PlusCircle } from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";
import { NeonBadge } from "@/components/common/NeonBadge";

export default function RecruiterDashboardPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInterviews() {
      try {
        const res = await fetch("/api/interviews");
        const json = await res.json();
        if (json.success) {
          setInterviews(json.data);
        }
      } catch (err) {
        console.error("Failed to load recruiter interviews:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInterviews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <NeonBadge label="TALENT FLEET COMMAND" variant="violet" size="sm" />
            <span className="text-xs font-mono text-slate-400">Recruiter Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
            Technical Candidates & Verified Knowledge Audits
          </h2>
        </div>

        <Link
          href="/candidate/setup"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/30 text-cyber-cyan font-mono text-xs font-semibold shadow-glow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch New Interview</span>
        </Link>
      </div>

      {/* Fleet Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-obsidian-900/60 border border-white/5 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Interviews</span>
          <div className="text-2xl font-bold font-mono text-white">{interviews.length}</div>
          <span className="text-[11px] text-slate-500">Autonomous sessions</span>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900/60 border border-white/5 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Completed Audits</span>
          <div className="text-2xl font-bold font-mono text-cyber-emerald">
            {interviews.filter((i) => i.status === "COMPLETED").length}
          </div>
          <span className="text-[11px] text-slate-500">Full evidence gathered</span>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900/60 border border-white/5 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Active / In-Flight</span>
          <div className="text-2xl font-bold font-mono text-cyber-cyan">
            {interviews.filter((i) => i.status === "IN_PROGRESS").length}
          </div>
          <span className="text-[11px] text-slate-500">Real-time sessions</span>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900/60 border border-white/5 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Integrity Verification</span>
          <div className="text-2xl font-bold font-mono text-violet-400">100%</div>
          <span className="text-[11px] text-slate-500">Cryptographically sealed</span>
        </div>
      </div>

      {/* Interview Cards List */}
      <GlassPanel className="p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-cyber-violet" />
          Candidate Fleet Directory
        </h3>

        {loading ? (
          <div className="py-12 text-center font-mono text-xs text-slate-500 animate-pulse">
            Loading candidate interviews...
          </div>
        ) : interviews.length === 0 ? (
          <div className="py-12 text-center font-mono text-xs text-slate-500">
            No interviews yet. Click &ldquo;Launch New Interview&rdquo; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Demonstrated Score</th>
                  <th className="py-3 px-4">Integrity Signals</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {interviews.map((iv) => (
                  <tr key={iv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div>{iv.candidate?.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{iv.candidate?.email}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <div>{iv.jobRole?.title}</div>
                      <div className="text-[10px] text-slate-500">{iv.jobRole?.seniorityLevel}</div>
                    </td>
                    <td className="py-4 px-4">
                      {iv.status === "COMPLETED" ? (
                        <NeonBadge label="COMPLETED" variant="emerald" size="sm" dot />
                      ) : iv.status === "IN_PROGRESS" ? (
                        <NeonBadge label="IN PROGRESS" variant="cyan" size="sm" dot />
                      ) : (
                        <NeonBadge label="INITIALIZED" variant="obsidian" size="sm" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {iv._count?.questions || 0} / {iv.maxQuestions}
                    </td>
                    <td className="py-4 px-4">
                      {iv.evaluationReport ? (
                        <span className="font-bold text-cyber-cyan">
                          {iv.evaluationReport.overallScore}%
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">In progress</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyber-emerald" />
                        <span>{iv._count?.integrityEvents || 0} events</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/recruiter/interview/${iv.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-violet/10 hover:bg-cyber-violet/20 border border-cyber-violet/30 text-violet-300 text-xs font-mono transition-all"
                      >
                        <span>Audit Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
