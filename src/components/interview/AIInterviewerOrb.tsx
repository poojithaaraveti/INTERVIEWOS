"use client";

import React from "react";
import { Mic, Volume2, BrainCircuit, Sparkles } from "lucide-react";
import { NeonBadge } from "../common/NeonBadge";

export type AIOrbState = "IDLE" | "SPEAKING" | "LISTENING" | "THINKING";

interface AIInterviewerOrbProps {
  state: AIOrbState;
  currentQuestion?: string;
  stageName?: string;
  difficulty?: number;
}

export function AIInterviewerOrb({
  state,
  currentQuestion,
  stageName = "ADAPTIVE INVESTIGATION",
  difficulty = 3,
}: AIInterviewerOrbProps) {
  const stateConfig = {
    IDLE: {
      badge: "STANDBY",
      variant: "obsidian" as const,
      icon: Sparkles,
      color: "from-slate-700 to-slate-900 border-slate-700",
      glow: "",
      ring: "border-slate-800",
      statusText: "Ready when you are",
    },
    SPEAKING: {
      badge: "AI SPEAKING",
      variant: "cyan" as const,
      icon: Volume2,
      color: "from-cyber-cyan via-blue-600 to-cyber-violet border-cyber-cyan",
      glow: "shadow-[0_0_60px_rgba(6,182,212,0.4)]",
      ring: "border-cyber-cyan/50 animate-ping",
      statusText: "Delivering spoken question...",
    },
    LISTENING: {
      badge: "LISTENING TO CANDIDATE",
      variant: "emerald" as const,
      icon: Mic,
      color: "from-cyber-emerald via-teal-600 to-cyber-cyan border-cyber-emerald",
      glow: "shadow-[0_0_60px_rgba(16,185,129,0.4)]",
      ring: "border-cyber-emerald/40 animate-pulse",
      statusText: "Analyzing speech & reasoning in real-time...",
    },
    THINKING: {
      badge: "EVALUATING REASONING",
      variant: "violet" as const,
      icon: BrainCircuit,
      color: "from-cyber-violet via-fuchsia-600 to-indigo-700 border-cyber-violet",
      glow: "shadow-[0_0_60px_rgba(139,92,246,0.4)]",
      ring: "border-cyber-violet/50 animate-spin",
      statusText: "Updating Knowledge Depth & deciding next investigation...",
    },
  };

  const current = stateConfig[state];
  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 relative">
      {/* Background ambient radial glow */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-cyber-cyan/10 via-cyber-violet/10 to-transparent blur-3xl pointer-events-none" />

      {/* Outer Rotating Energy Ring */}
      <div className="relative flex items-center justify-center mb-6">
        <div
          className={`absolute w-44 h-44 rounded-full border border-dashed ${current.ring} transition-all duration-700 pointer-events-none`}
        />
        <div className="absolute w-36 h-36 rounded-full border border-white/10 animate-pulse" />

        {/* Central Core Orb */}
        <div
          className={`w-28 h-28 rounded-full bg-gradient-to-tr ${current.color} border-2 flex items-center justify-center transition-all duration-500 animate-orb-float ${current.glow}`}
        >
          <Icon className="w-10 h-10 text-white drop-shadow-md animate-pulse" />
        </div>
      </div>

      {/* State Badge & Indicators */}
      <div className="flex flex-col items-center gap-2 z-10 text-center max-w-xl">
        <div className="flex items-center gap-2">
          <NeonBadge label={current.badge} variant={current.variant} dot size="md" />
          <span className="text-xs font-mono text-slate-400">
            [Diff: {difficulty}/5]
          </span>
        </div>
        <p className="text-xs font-mono text-slate-400">{current.statusText}</p>

        {/* Spoken Question Highlight */}
        {currentQuestion && (
          <div className="mt-4 p-4 rounded-xl bg-obsidian-950/70 border border-white/10 shadow-inner max-w-2xl">
            <p className="text-base font-medium text-slate-100 leading-relaxed font-sans">
              &ldquo;{currentQuestion}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
