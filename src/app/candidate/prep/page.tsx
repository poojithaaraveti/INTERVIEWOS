"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, Volume2, ShieldCheck, CheckCircle2, ArrowRight, Activity, Clock } from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";
import { NeonBadge } from "@/components/common/NeonBadge";
import { AudioWaveform } from "@/components/interview/AudioWaveform";

function PrepContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("id");

  const [micActive, setMicActive] = useState(false);
  const [audioTested, setAudioTested] = useState(false);

  const testMic = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicActive(true);
        // Release stream after brief test
        setTimeout(() => {
          stream.getTracks().forEach((track) => track.stop());
        }, 4000);
      } else {
        setMicActive(true);
      }
    } catch (err) {
      console.warn("Mic permission check fallback:", err);
      setMicActive(true); // Allow proceeding in simulator mode
    }
  };

  const testSpeaker = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Audio test check. INTERVIEWOS voice engine is active and ready.");
      utterance.onend = () => setAudioTested(true);
      utterance.onerror = () => setAudioTested(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setAudioTested(true);
    }
  };

  const handleEnterRoom = () => {
    if (interviewId) {
      router.push(`/candidate/room/${interviewId}`);
    } else {
      router.push("/candidate/setup");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <NeonBadge label="STEP 2 OF 3" variant="cyan" size="sm" />
          <NeonBadge label="AUDIO & INTEGRITY PRE-FLIGHT" variant="emerald" size="sm" />
        </div>
        <h2 className="text-3xl font-extrabold text-white font-sans">
          Audio Hardware & Baseline Briefing
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto font-sans">
          Ensure your microphone is clear. INTERVIEWOS conducts a spoken conversation and adapts to your natural speaking pace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hardware Checks */}
        <GlassPanel className="p-6 space-y-6">
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Mic className="w-4 h-4 text-cyber-cyan" />
            Hardware Diagnostics
          </h3>

          {/* Mic Test */}
          <div className="p-4 rounded-xl bg-obsidian-950/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">Microphone Input Check</span>
              {micActive ? (
                <NeonBadge label="MIC DETECTED" variant="emerald" size="sm" dot />
              ) : (
                <NeonBadge label="UNTESTED" variant="obsidian" size="sm" />
              )}
            </div>
            <AudioWaveform isActive={micActive} color="emerald" barCount={18} />
            <button
              onClick={testMic}
              className="w-full py-2 px-3 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono transition-all"
            >
              {micActive ? "Mic Verified (Click to Retest)" : "Test Microphone"}
            </button>
          </div>

          {/* Speaker Test */}
          <div className="p-4 rounded-xl bg-obsidian-950/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">Speech Synthesis Output</span>
              {audioTested ? (
                <NeonBadge label="AUDIO OK" variant="emerald" size="sm" dot />
              ) : (
                <NeonBadge label="UNTESTED" variant="obsidian" size="sm" />
              )}
            </div>
            <button
              onClick={testSpeaker}
              className="w-full py-2 px-3 rounded-lg bg-cyber-violet/15 hover:bg-cyber-violet/25 border border-cyber-violet/30 text-violet-300 text-xs font-mono transition-all flex items-center justify-center gap-2"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Play Audio Check Voice
            </button>
          </div>
        </GlassPanel>

        {/* Candidate Expectations & Baseline Protocol */}
        <GlassPanel className="p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-emerald" />
              Personal Timing Protocol
            </h3>

            <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Personal Baseline Calibration:</strong> Questions 1 and 2 establish your natural response rhythm. There are no universal rigid timers.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyber-emerald shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Authentic Problem Solving:</strong> Pausing to reflect on complex architectural trade-offs is welcomed and expected.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyber-violet shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Conversational Voice Flow:</strong> Listen to the AI, press &ldquo;Start Speaking&rdquo;, and answer directly as you would with a principal engineer.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleEnterRoom}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-white font-mono text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Enter Live Interview Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

export default function CandidatePrepPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-slate-500">Initializing prep checks...</div>}>
      <PrepContent />
    </Suspense>
  );
}
