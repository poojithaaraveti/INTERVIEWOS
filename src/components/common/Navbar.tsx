"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Terminal, Users, ShieldCheck } from "lucide-react";
import { NeonBadge } from "./NeonBadge";

export function Navbar() {
  const pathname = usePathname();

  const isCandidate = pathname.startsWith("/candidate");
  const isRecruiter = pathname.startsWith("/recruiter");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-obsidian-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan/30 to-cyber-violet/30 border border-cyber-cyan/50 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-cyber-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-lg text-white">
                INTERVIEW<span className="text-cyber-cyan">OS</span>
              </span>
              <NeonBadge label="v1.0" variant="cyan" size="sm" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
              Adaptive Spoken Intelligence
            </p>
          </div>
        </Link>

        {/* Navigation Switcher */}
        <nav className="hidden md:flex items-center gap-1 bg-obsidian-900/60 p-1 rounded-xl border border-white/5">
          <Link
            href="/candidate/setup"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
              isCandidate
                ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Candidate Room
          </Link>
          <Link
            href="/recruiter/dashboard"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
              isRecruiter
                ? "bg-cyber-violet/15 text-violet-300 border border-cyber-violet/30 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Recruiter Center
          </Link>
        </nav>

        {/* Integrity & Engine Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyber-emerald" />
            <span className="text-xs font-mono text-slate-400">Cryptographic Hash-Chain Active</span>
          </div>
          <NeonBadge label="LIVE AI" variant="emerald" dot size="sm" />
        </div>
      </div>
    </header>
  );
}
