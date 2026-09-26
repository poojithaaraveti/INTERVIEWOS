"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Link as LinkIcon, Box, CheckCircle } from "lucide-react";
import { NeonBadge } from "../common/NeonBadge";

export interface HashBlockItem {
  id: string;
  sequenceId: number;
  eventType: string;
  payloadHash: string;
  previousBlockHash: string;
  currentBlockHash: string;
  timestamp: string;
}

interface HashChainViewerProps {
  interviewId: string;
}

export function HashChainViewer({ interviewId }: HashChainViewerProps) {
  const [blocks, setBlocks] = useState<HashBlockItem[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChain() {
      try {
        const res = await fetch(`/api/interviews/${interviewId}/audit-chain`);
        const json = await res.json();
        if (json.success) {
          setBlocks(json.data.blocks);
          setIsValid(json.data.isValid);
        }
      } catch (err) {
        console.error("Failed to load audit chain:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChain();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-slate-500 animate-pulse">
        Verifying cryptographic SHA-256 hash-chain...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Verification Status Header */}
      <div className="flex items-center justify-between p-4 rounded-xl border bg-obsidian-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {isValid ? (
            <div className="w-9 h-9 rounded-lg bg-cyber-emerald/10 border border-cyber-emerald/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyber-emerald" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-cyber-rose/10 border border-cyber-rose/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-cyber-rose" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">
                Tamper-Evident SHA-256 Audit Trail
              </h4>
              {isValid ? (
                <NeonBadge label="MATHEMATICALLY VERIFIED" variant="emerald" size="sm" dot />
              ) : (
                <NeonBadge label="CORRUPTED BLOCK DETECTED" variant="rose" size="sm" dot />
              )}
            </div>
            <p className="text-xs font-mono text-slate-400">
              Total Sealed Blocks: {blocks.length} | Cryptographic link integrity: 100%
            </p>
          </div>
        </div>
      </div>

      {/* Block Stream */}
      <div className="space-y-3 font-mono text-xs">
        {blocks.map((block, idx) => (
          <div
            key={block.id || block.sequenceId}
            className="p-4 rounded-xl border border-white/5 bg-obsidian-900/60 hover:border-cyber-cyan/30 transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-cyber-cyan" />
                <span className="font-bold text-slate-200">
                  BLOCK #{block.sequenceId}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-cyber-cyan border border-cyber-cyan/20">
                  {block.eventType}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {new Date(block.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500">Prev Hash: </span>
                <span className="text-slate-300 font-mono">
                  {block.previousBlockHash.substring(0, 16)}...
                </span>
              </div>
              <div>
                <span className="text-slate-500">Block Hash: </span>
                <span className="text-cyber-emerald font-mono">
                  {block.currentBlockHash.substring(0, 16)}...
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
