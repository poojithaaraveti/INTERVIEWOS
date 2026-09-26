"use client";

import React, { useEffect, useState } from "react";

interface AudioWaveformProps {
  isActive: boolean;
  barCount?: number;
  color?: "cyan" | "emerald" | "violet";
}

export function AudioWaveform({
  isActive,
  barCount = 24,
  color = "emerald",
}: AudioWaveformProps) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial flat heights
    setHeights(Array.from({ length: barCount }, () => 15));
  }, [barCount]);

  useEffect(() => {
    if (!isActive) {
      setHeights(Array.from({ length: barCount }, () => 12));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: barCount }, () => {
          // Dynamic jitter based on natural voice frequencies (center higher than flanks)
          return Math.floor(Math.random() * 75) + 20;
        })
      );
    }, 90);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  const colorStyles = {
    cyan: "bg-cyber-cyan shadow-[0_0_8px_#06B6D4]",
    emerald: "bg-cyber-emerald shadow-[0_0_8px_#10B981]",
    violet: "bg-cyber-violet shadow-[0_0_8px_#8B5CF6]",
  };

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 w-full px-4 bg-obsidian-950/60 rounded-xl border border-white/5 overflow-hidden">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-100 ${
            isActive ? colorStyles[color] : "bg-slate-700/50"
          }`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
