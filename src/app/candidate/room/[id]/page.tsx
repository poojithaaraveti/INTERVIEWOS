"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Shield, LogOut, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";
import { NeonBadge } from "@/components/common/NeonBadge";
import { AIInterviewerOrb, AIOrbState } from "@/components/interview/AIInterviewerOrb";
import { SpeechController } from "@/components/interview/SpeechController";
import { KnowledgeTrackerWidget, SkillTrackerItem } from "@/components/interview/KnowledgeTrackerWidget";
import { TelemetryMonitor } from "@/components/interview/TelemetryMonitor";

export default function LiveInterviewRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const interviewId = resolvedParams.id;

  const [session, setSession] = useState<any | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [orbState, setOrbState] = useState<AIOrbState>("IDLE");
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  // 1. Initialize or Resume Interview
  useEffect(() => {
    async function initInterview() {
      try {
        setLoading(true);
        const res = await fetch(`/api/interviews/${interviewId}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        if (json.success) {
          setCurrentQuestion(json.data.question);
          setOrbState("SPEAKING");
        }

        // Fetch full session details
        const sessionRes = await fetch(`/api/interviews/${interviewId}`);
        const sessionJson = await sessionRes.json();
        if (sessionJson.success) {
          setSession(sessionJson.data);
        }
      } catch (err) {
        console.error("Failed to start session:", err);
      } finally {
        setLoading(false);
      }
    }

    initInterview();
  }, [interviewId]);

  // 2. Handle Spoken Answer Submission
  const handleAnswerSubmit = async (payload: {
    transcriptText: string;
    speechStartedAt: string;
    speechEndedAt: string;
    responseGapMs: number;
    totalDurationMs: number;
    pauses: Array<{ startOffsetMs: number; durationMs: number }>;
    longestPauseMs: number;
    averagePauseMs: number;
    speechPauseRatio: number;
  }) => {
    if (!currentQuestion) return;

    setOrbState("THINKING");
    try {
      const res = await fetch(`/api/interviews/${interviewId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          ...payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Check if finished
        if (json.data.isFinished || !json.data.nextQuestion) {
          setIsFinishing(true);
          // Trigger complete synthesis
          await fetch(`/api/interviews/${interviewId}/complete`, {
            method: "POST",
          });
          router.push(`/candidate/results/${interviewId}`);
          return;
        }

        // Update with next question
        setCurrentQuestion(json.data.nextQuestion);
        setOrbState("SPEAKING");

        if (json.data.evaluation?.demonstratedEvidence?.length > 0) {
          setLastFeedback(`Verified: ${json.data.evaluation.demonstratedEvidence[0]}`);
        }

        // Refresh session state
        const sessionRes = await fetch(`/api/interviews/${interviewId}`);
        const sessionJson = await sessionRes.json();
        if (sessionJson.success) {
          setSession(sessionJson.data);
        }
      }
    } catch (err) {
      console.error("Failed to evaluate answer:", err);
      setOrbState("IDLE");
    }
  };

  const handleManualConclude = async () => {
    setIsFinishing(true);
    try {
      await fetch(`/api/interviews/${interviewId}/complete`, { method: "POST" });
      router.push(`/candidate/results/${interviewId}`);
    } catch (err) {
      console.error(err);
      router.push(`/candidate/results/${interviewId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyber-cyan border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400">
          Initializing cryptographic session & assembling Knowledge Map...
        </p>
      </div>
    );
  }

  // Transform claims into skill tracker items
  const skillsTrackerList: SkillTrackerItem[] = (session?.resumeProfile?.claims || []).map((c: any) => ({
    name: c.topic,
    depth: c.verifiedDepth > 0 ? c.verifiedDepth : null,
    status: c.coverageStatus,
    importance: c.importance,
  }));

  const turnNumber = session?.questions?.length || 1;
  const maxTurns = session?.maxQuestions || 8;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col space-y-6">
      {/* Invisible Telemetry Listener */}
      <TelemetryMonitor interviewId={interviewId} contextQuestionId={currentQuestion?.id} />

      {/* Top Cockpit Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-mono">
                SESSION #{interviewId.substring(0, 8)}
              </h2>
              <NeonBadge
                label={session?.currentStage?.replace("_", " ") || "ACTIVE"}
                variant="cyan"
                size="sm"
                dot
              />
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Role: {session?.jobRole?.title || "Technical Role"} | Candidate: {session?.candidate?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-900 border border-white/5 text-[11px] font-mono text-slate-400">
            <Shield className="w-3.5 h-3.5 text-cyber-emerald" />
            <span>SHA-256 Hash Chain Locked</span>
          </div>
          <button
            onClick={handleManualConclude}
            disabled={isFinishing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-900 hover:bg-cyber-rose/10 text-slate-400 hover:text-rose-400 border border-white/10 text-xs font-mono transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Finish Interview</span>
          </button>
        </div>
      </div>

      {/* Main Grid: AI Orb & Spoken Controls (Left) + Knowledge Radar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: AI Presence + Speech Controls */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
          <GlassPanel glow="cyan" className="flex-1 flex flex-col justify-center items-center p-6 relative">
            <AIInterviewerOrb
              state={orbState}
              currentQuestion={currentQuestion?.questionText}
              stageName={session?.currentStage}
              difficulty={currentQuestion?.targetDifficulty || 2}
            />

            {lastFeedback && (
              <div className="mt-2 text-center">
                <span className="text-[11px] font-mono text-cyber-emerald bg-cyber-emerald/10 border border-cyber-emerald/20 px-3 py-1 rounded-full">
                  {lastFeedback}
                </span>
              </div>
            )}
          </GlassPanel>

          {/* Spoken Interaction Controller */}
          <GlassPanel className="p-6">
            <SpeechController
              questionText={currentQuestion?.questionText || ""}
              isAIThinking={orbState === "THINKING" || isFinishing}
              onAnswerSubmit={handleAnswerSubmit}
            />
          </GlassPanel>
        </div>

        {/* Right Column: Live Knowledge Map Radar */}
        <div className="h-full">
          <KnowledgeTrackerWidget
            skills={skillsTrackerList}
            currentTurn={turnNumber}
            maxTurns={maxTurns}
          />
        </div>
      </div>
    </div>
  );
}
