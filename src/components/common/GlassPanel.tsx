import React from "react";
import { clsx } from "clsx";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: "cyan" | "violet" | "emerald" | "none";
  className?: string;
}

export function GlassPanel({
  children,
  glow = "none",
  className,
  ...props
}: GlassPanelProps) {
  const glowClasses = {
    cyan: "hover:border-cyber-cyan/40 hover:shadow-glow transition-all duration-300",
    violet: "hover:border-cyber-violet/40 hover:shadow-glow-violet transition-all duration-300",
    emerald: "hover:border-cyber-emerald/40 hover:shadow-glow-emerald transition-all duration-300",
    none: "",
  };

  return (
    <div
      className={clsx(
        "bg-obsidian-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden",
        glowClasses[glow],
        className
      )}
      {...props}
    >
      {/* Subtle top glare highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
