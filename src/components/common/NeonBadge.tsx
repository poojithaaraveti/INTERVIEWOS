import React from "react";
import { clsx } from "clsx";

export type BadgeVariant =
  | "cyan"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "obsidian";

interface NeonBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export function NeonBadge({
  label,
  variant = "cyan",
  size = "md",
  dot = false,
  className,
}: NeonBadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    cyan: "bg-cyber-cyan/10 text-cyan-400 border-cyber-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]",
    violet: "bg-cyber-violet/10 text-violet-400 border-cyber-violet/30 shadow-[0_0_10px_rgba(139,92,246,0.15)]",
    emerald: "bg-cyber-emerald/10 text-emerald-400 border-cyber-emerald/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    amber: "bg-cyber-amber/10 text-amber-400 border-cyber-amber/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
    rose: "bg-cyber-rose/10 text-rose-400 border-cyber-rose/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]",
    obsidian: "bg-obsidian-800 text-slate-300 border-slate-700",
  };

  const dotColors: Record<BadgeVariant, string> = {
    cyan: "bg-cyber-cyan shadow-[0_0_8px_#06B6D4]",
    violet: "bg-cyber-violet shadow-[0_0_8px_#8B5CF6]",
    emerald: "bg-cyber-emerald shadow-[0_0_8px_#10B981]",
    amber: "bg-cyber-amber shadow-[0_0_8px_#F59E0B]",
    rose: "bg-cyber-rose shadow-[0_0_8px_#F43F5E]",
    obsidian: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5",
    md: "text-xs px-3 py-1 font-medium",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border transition-all font-mono tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full inline-block animate-pulse", dotColors[variant])}
        />
      )}
      {label}
    </span>
  );
}
