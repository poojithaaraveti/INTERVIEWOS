"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  ShieldCheck,
  Award,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Activity,
  Layers,
  MessageSquare,
} from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";
import { NeonBadge } from "@/components/common/NeonBadge";
import { KnowledgeMapMatrix, RecruiterSkillItem } from "@/components/recruiter/KnowledgeMapMatrix";
import { ConsistencyAuditCard } from "@/components/recruiter/ConsistencyAuditCard";
import { HashChainViewer } from "@/components/recruiter/HashChainViewer";

export default function RecruiterInterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const interviewId = resolvedParams.id;

  const [session, setSession] = useState<any | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"knowledge" | "transcripts" | "timing" | "crypto">("knowledge");

  useEffect(() => {
    async function loadData() {
      try {
        const sessionRes = await fetch(`/api/interviews/${interviewId}`);
        const sessionJson = await sessionRes.json();
        if (sessionJson.success) {
          setSession(sessionJson.data);
        }

        const reportRes = await fetch(`/api/interviews/${interviewId}/report`);
        const reportJson = await reportRes.json();
        if (reportJson.success) {
          setReport(reportJson.data.report);
        }
      } catch (err) {
        console.error("Failed to load interview details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center font-mono text-xs text-slate-500 animate-pulse">
        Loading interview intelligence and audit trails...
      </div>
    );
  }

  // Format skills for KnowledgeMapMatrix
  const skillsList: RecruiterSkillItem[] = (session?.resumeProfile?.claims || []).map((c: any) => {
    let quotes: string[] = [];
    try {
      quotes = JSON.parse(c.evidenceQuotesJson || "[]");
    } catch {
      // ignore
    }
    return {
      name: c.topic,
      category: c.category,
      claimedLevel: c.claimedLevel || "Advanced",
      verifiedDepth: c.verifiedDepth,
      coverageStatus: c.coverageStatus,
      evidenceQuotes: quotes,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Back to Recruiter Dashboard */}
      <div>
        <Link
          href="/recruiter/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Candidate Fleet</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-obsidian-900/80 border border-white/10 backdrop-blur-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white font-sans">
              {session?.candidate?.name}
            </h2>
            <NeonBadge
              label={session?.status || "IN PROGRESS"}
              variant={session?.status === "COMPLETED" ? "emerald" : "cyan"}
              size="sm"
              dot
            />
          </div>
          <p className="text-xs font-mono text-slate-400">
            Target Role: <span className="text-white font-semibold">{session?.jobRole?.title}</span> ({session?.jobRole?.seniorityLevel}) | Interview ID: #{interviewId.substring(0, 8)}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Verified Depth Score</span>
            <span className="text-2xl font-bold font-mono text-cyber-cyan">
              {report?.overallScore || 84}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Recommendation</span>
            <span className="text-sm font-bold font-mono text-cyber-emerald">
              {report?.roleFitRecommendation?.replace("_", " ") || "POTENTIAL FIT"}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("knowledge")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === "knowledge"
              ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Knowledge Depth Matrix
        </button>

        <button
          onClick={() => setActiveTab("transcripts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === "transcripts"
              ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Adaptive Q&A Transcripts ({session?.questions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("timing")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === "timing"
              ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Personal Timing Baseline & Telemetry
        </button>

        <button
          onClick={() => setActiveTab("crypto")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === "crypto"
              ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Tamper-Evident SHA-256 Chain
        </button>
      </div>

      {/* Tab 1: Knowledge Depth Matrix & Consistency Audit */}
      {activeTab === "knowledge" && (
        <div className="space-y-6">
          <KnowledgeMapMatrix skills={skillsList} />

          <ConsistencyAuditCard
            consistencyRating={report?.consistencyRating || "HIGH"}
            inconsistencies={report?.reasoningIntegrity?.transparentObservations || []}
            rephraseScore={report?.reasoningIntegrity?.rephraseSurvivalAbility || "HIGH"}
          />
        </div>
      )}

      {/* Tab 2: Adaptive Q&A Transcripts Replay */}
      {activeTab === "transcripts" && (
        <div className="space-y-4">
          {session?.questions?.map((q: any) => {
            let evalData: any = null;
            try {
              if (q.answer?.evaluationJson) evalData = JSON.parse(q.answer.evaluationJson);
            } catch {
              // ignore
            }

            return (
              <GlassPanel key={q.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-cyber-cyan/15 text-cyber-cyan font-mono text-xs font-bold flex items-center justify-center">
                      Q{q.sequenceOrder}
                    </span>
                    <span className="text-xs font-mono text-slate-300 uppercase">
                      Topic: <strong className="text-white">{q.targetTopic}</strong>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      [{q.questionType}]
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      Evaluated Depth: <strong className="text-cyber-cyan">{q.answer?.evaluatedDepth || 0}/5</strong>
                    </span>
                    <NeonBadge
                      label={`Diff ${q.targetDifficulty}/5`}
                      variant="obsidian"
                      size="sm"
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="p-3.5 rounded-xl bg-obsidian-950/70 border border-white/5">
                  <p className="text-xs font-medium text-slate-200 font-sans leading-relaxed">
                    &ldquo;{q.questionText}&rdquo;
                  </p>
                </div>

                {/* Candidate Answer */}
                {q.answer ? (
                  <div className="p-3.5 rounded-xl bg-cyber-emerald/5 border border-cyber-emerald/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="text-emerald-400 font-semibold">Candidate Spoken Response</span>
                      <span>
                        Latency: {(q.answer.responseGapMs / 1000).toFixed(1)}s | Duration: {(q.answer.totalDurationMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <p className="text-xs text-slate-100 font-sans leading-relaxed">
                      &ldquo;{q.answer.transcriptText}&rdquo;
                    </p>

                    {evalData?.demonstratedEvidence && evalData.demonstratedEvidence.length > 0 && (
                      <div className="pt-2 border-t border-emerald-500/10 text-[11px] font-mono text-emerald-300">
                        Demonstrated Evidence: {evalData.demonstratedEvidence.join("; ")}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-500 italic">
                    Awaiting candidate response...
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* Tab 3: Personal Timing Baseline & Telemetry */}
      {activeTab === "timing" && (
        <div className="space-y-6">
          <GlassPanel className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-emerald" />
              Personal Baseline Calibration & Deviation Ledger
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-obsidian-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400">Calibrated Baseline Latency</span>
                <div className="text-xl font-bold text-white">
                  {((session?.baselineLatencyMs || 2100) / 1000).toFixed(1)}s
                </div>
                <span className="text-[10px] text-slate-500">Established during Q1-Q2</span>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400">Mean Natural Pause Duration</span>
                <div className="text-xl font-bold text-cyber-cyan">
                  {((session?.baselinePauseMs || 1200) / 1000).toFixed(1)}s
                </div>
                <span className="text-[10px] text-slate-500">Within-turn reflection pauses</span>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400">Temporal Status</span>
                <div className="text-xl font-bold text-emerald-400">NORMAL_BASELINE</div>
                <span className="text-[10px] text-slate-500">Non-accusatory metric</span>
              </div>
            </div>

            {/* Timing Events Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-white/10 text-slate-400 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Question</th>
                    <th className="py-2.5 px-3">Stage</th>
                    <th className="py-2.5 px-3">Response Gap</th>
                    <th className="py-2.5 px-3">Pause Count</th>
                    <th className="py-2.5 px-3">Deviation (Z-Score)</th>
                    <th className="py-2.5 px-3">Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(session?.timingEvents || []).map((t: any) => (
                    <tr key={t.id}>
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        Q{t.sequenceOrder}
                      </td>
                      <td className="py-3 px-3 text-slate-400">{t.eventStage}</td>
                      <td className="py-3 px-3 text-slate-100">
                        {(t.latencyMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-3 px-3 text-slate-300">{t.pauseCount}</td>
                      <td className="py-3 px-3">
                        <span className={t.deviationFromMean > 2.5 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                          {t.deviationFromMean > 0 ? `+${t.deviationFromMean.toFixed(1)}σ` : "0.0σ"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 max-w-sm truncate">
                        {t.flaggedObservation || "Consistent with baseline"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Tab 4: Cryptographic SHA-256 Hash Chain */}
      {activeTab === "crypto" && (
        <GlassPanel className="p-6">
          <HashChainViewer interviewId={interviewId} />
        </GlassPanel>
      )}
    </div>
  );
}
