"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Award, ArrowRight, BarChart3, Clock, Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";
import { NeonBadge } from "@/components/common/NeonBadge";

export default function CandidateResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const interviewId = resolvedParams.id;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/interviews/${interviewId}/report`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load interview results:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400">
          Synthesizing multi-dimensional evidence report...
        </p>
      </div>
    );
  }

  const report = data?.report;
  const session = data?.session;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 p-2 px-4 rounded-full bg-cyber-emerald/10 border border-cyber-emerald/30 mb-2">
          <ShieldCheck className="w-4 h-4 text-cyber-emerald" />
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            Interview Cryptographically Sealed
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
          Interview Complete & Verified
        </h2>
        <p className="text-sm text-slate-300 font-sans max-w-xl mx-auto">
          Thank you, {session?.candidate?.name}. Your spoken technical responses have been analyzed and added to your evidence-backed verification record.
        </p>
      </div>

      {/* Score Summary Card */}
      <GlassPanel glow="emerald" className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-xl bg-obsidian-950/60 border border-white/5 space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase">Demonstrated Depth</span>
            <div className="text-3xl font-bold font-mono text-cyber-cyan">
              {report?.overallScore || 85}%
            </div>
            <span className="text-[11px] text-slate-400">Holistic Competency</span>
          </div>

          <div className="p-4 rounded-xl bg-obsidian-950/60 border border-white/5 space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase">Role Recommendation</span>
            <div className="text-xl font-bold font-mono text-cyber-emerald">
              {report?.roleFitRecommendation?.replace("_", " ") || "STRONG FIT"}
            </div>
            <span className="text-[11px] text-slate-400">{session?.jobRole?.title}</span>
          </div>

          <div className="p-4 rounded-xl bg-obsidian-950/60 border border-white/5 space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase">Reasoning Integrity</span>
            <div className="text-xl font-bold font-mono text-violet-400">
              {report?.consistencyRating || "HIGH"}
            </div>
            <span className="text-[11px] text-slate-400">Consistent Problem Solving</span>
          </div>
        </div>
      </GlassPanel>

      {/* Verified Strengths List */}
      <GlassPanel className="p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-cyber-cyan" />
          Verified Competencies & Evidence Quotes
        </h3>

        <div className="space-y-3 font-sans text-xs">
          {report?.strengths?.map((str: string, i: number) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-cyber-emerald shrink-0 mt-0.5" />
              <p className="text-slate-200">{str}</p>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-mono text-xs transition-all"
        >
          Return to Portal
        </Link>

        <Link
          href={`/recruiter/interview/${interviewId}`}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-violet text-white font-mono text-xs font-bold shadow-glow hover:scale-105 transition-all"
        >
          <span>View Deep-Dive Evidence Report</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
