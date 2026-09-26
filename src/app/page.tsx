import React from "react";
import Link from "next/link";
import { Terminal, Users, Sparkles, BrainCircuit, ShieldCheck, ArrowRight, Activity, Cpu } from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";
import { NeonBadge } from "@/components/common/NeonBadge";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto w-full">
      {/* Hero Badge */}
      <div className="flex items-center gap-2 mb-6">
        <NeonBadge label="HACKATHON PROTOTYPE" variant="cyan" dot />
        <NeonBadge label="ADAPTIVE ENGINE ONLINE" variant="emerald" />
      </div>

      {/* Main Title */}
      <div className="text-center max-w-4xl space-y-4 mb-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-white">
          The Autonomous{" "}
          <span className="bg-gradient-to-r from-cyber-cyan via-blue-400 to-cyber-violet bg-clip-text text-transparent">
            Adaptive Technical Interviewer
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 font-sans leading-relaxed max-w-3xl mx-auto">
          INTERVIEWOS reads candidate resumes, builds a structured Knowledge Map, and conducts an emerging spoken interview where every answer changes the state of what to investigate next.
        </p>
      </div>

      {/* Defining Product Principle Banner */}
      <div className="w-full max-w-3xl mb-12">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyber-cyan/10 via-cyber-violet/10 to-transparent border border-cyber-cyan/30 backdrop-blur-xl relative overflow-hidden shadow-glow">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-cyber-cyan" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyber-cyan font-bold">
                Defining Product Principle
              </span>
              <p className="text-sm font-medium text-slate-200 mt-1 italic leading-relaxed">
                &ldquo;The AI should not simply ask questions about a resume. It should continuously investigate the evidence behind the candidate&apos;s claims and dynamically decide what it needs to know next.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection Gateways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
        {/* Candidate Portal */}
        <Link href="/candidate/setup" className="group">
          <GlassPanel glow="cyan" className="h-full flex flex-col justify-between p-8 group-hover:border-cyber-cyan/50">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform">
                <Terminal className="w-6 h-6 text-cyber-cyan" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white font-sans">Candidate Experience</h3>
                <NeonBadge label="LIVE VOICE" variant="cyan" size="sm" />
              </div>
              <p className="text-sm text-slate-300 font-sans leading-relaxed mb-6">
                Upload your resume, select your target engineering role, and step into an adaptive voice interview that tests genuine engineering problem-solving.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyber-cyan group-hover:translate-x-1 transition-transform">
              <span>Launch Candidate Setup</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </GlassPanel>
        </Link>

        {/* Recruiter Portal */}
        <Link href="/recruiter/dashboard" className="group">
          <GlassPanel glow="violet" className="h-full flex flex-col justify-between p-8 group-hover:border-cyber-violet/50">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyber-violet/10 border border-cyber-violet/30 flex items-center justify-center mb-6 shadow-glow-violet group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-cyber-violet" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white font-sans">Recruiter Command Center</h3>
                <NeonBadge label="AUDIT PROOF" variant="violet" size="sm" />
              </div>
              <p className="text-sm text-slate-300 font-sans leading-relaxed mb-6">
                Inspect candidate Knowledge Depth matrices (1–5 scale), cross-question consistency logs, personal timing baseline shifts, and tamper-evident SHA-256 hash chains.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyber-violet group-hover:translate-x-1 transition-transform">
              <span>Access Recruiter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </GlassPanel>
        </Link>
      </div>

      {/* Feature Pillar Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="p-5 rounded-2xl bg-obsidian-900/60 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-cyber-cyan text-xs font-mono font-bold uppercase">
            <Cpu className="w-4 h-4" />
            Knowledge Depth (1-5)
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Measures evidence-backed depth from Awareness (1) to Deep Architecture & Internals (5).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-obsidian-900/60 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-cyber-emerald text-xs font-mono font-bold uppercase">
            <Activity className="w-4 h-4" />
            Personal Timing Baseline
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Calibrates candidate&apos;s own response latency; tracks deviations without accusing of fraud.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-obsidian-900/60 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-cyber-violet text-xs font-mono font-bold uppercase">
            <ShieldCheck className="w-4 h-4" />
            Tamper-Evident Hash Chain
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Cryptographically seals every question, answer, and telemetry event using SHA-256 blocks.
          </p>
        </div>
      </div>
    </div>
  );
}
