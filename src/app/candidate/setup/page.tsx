"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, ArrowRight, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";
import { NeonBadge } from "@/components/common/NeonBadge";

export default function CandidateSetupPage() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState("Alex Morgan");
  const [candidateEmail, setCandidateEmail] = useState("alex.morgan@example.com");
  const [jobTitle, setJobTitle] = useState("Senior Distributed Systems Engineer");
  const [jobDescription, setJobDescription] = useState(
    "Architect distributed microservices with high concurrency, Redis caching, PostgreSQL query optimization, and Kafka event streaming."
  );
  const [resumeText, setResumeText] = useState(
    `Alex Morgan - Senior Software Engineer
Summary: 5+ years designing distributed systems, caching architectures, and resilient backends.
Skills: Node.js, TypeScript, Redis, PostgreSQL, Kafka, Docker, Kubernetes, React, System Design.
Experience:
- Senior Backend Engineer at CloudScale: Built distributed caching layer in Redis with Redlock and TTLs, reducing P99 latency by 55%. Handled 50,000 concurrent websocket connections.
- Software Engineer at FinTech Corp: Maintained core transaction ledger using PostgreSQL with partitioned tables and optimistic concurrency control.`
  );

  const [parsing, setParsing] = useState(false);
  const [extractedMap, setExtractedMap] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParseAndPreview = async () => {
    setParsing(true);
    setError(null);
    try {
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobTitle, jobDescription }),
      });
      const json = await res.json();
      if (json.success) {
        setExtractedMap(json.data);
      } else {
        setError(json.error?.message || "Failed to parse resume");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setParsing(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      setParsing(true);
      // Ensure we have a knowledge map
      let mapToUse = extractedMap;
      if (!mapToUse) {
        const parseRes = await fetch("/api/resume/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, jobTitle, jobDescription }),
        });
        const parseJson = await parseRes.json();
        mapToUse = parseJson.data;
      }

      // Create session
      const createRes = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateEmail,
          candidateName,
          jobTitle,
          jobDescription,
          resumeText,
          knowledgeMap: mapToUse,
        }),
      });

      const createJson = await createRes.json();
      if (createJson.success) {
        router.push(`/candidate/prep?id=${createJson.data.interviewId}`);
      } else {
        setError(createJson.error?.message || "Failed to initialize interview");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start interview");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Step Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <NeonBadge label="STEP 1 OF 3" variant="cyan" size="sm" />
            <span className="text-xs font-mono text-slate-400">Profile & Knowledge Intake</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
            Candidate Resume & Target Spec Setup
          </h2>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form inputs */}
        <div className="space-y-6">
          <GlassPanel className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyber-cyan" />
              Candidate Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Candidate Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full rounded-xl bg-obsidian-950/70 border border-white/10 px-3.5 py-2 text-xs text-slate-100 font-sans focus:outline-hidden focus:border-cyber-cyan/50"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Candidate Email</label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full rounded-xl bg-obsidian-950/70 border border-white/10 px-3.5 py-2 text-xs text-slate-100 font-sans focus:outline-hidden focus:border-cyber-cyan/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-xl bg-obsidian-950/70 border border-white/10 px-3.5 py-2 text-xs text-slate-100 font-sans focus:outline-hidden focus:border-cyber-cyan/50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Target Job Description Key Focus</label>
              <textarea
                rows={2}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full rounded-xl bg-obsidian-950/70 border border-white/10 px-3.5 py-2 text-xs text-slate-100 font-sans focus:outline-hidden focus:border-cyber-cyan/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono text-slate-400">Resume Content (Text / CV)</label>
                <button
                  type="button"
                  onClick={handleParseAndPreview}
                  disabled={parsing}
                  className="text-[11px] font-mono text-cyber-cyan hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {parsing ? "Extracting..." : "Scan & Extract Map"}
                </button>
              </div>
              <textarea
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste candidate resume here..."
                className="w-full rounded-xl bg-obsidian-950/70 border border-white/10 p-3.5 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-cyber-cyan/50 leading-relaxed"
              />
            </div>
          </GlassPanel>

          <button
            onClick={handleStartInterview}
            disabled={parsing || !resumeText.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyber-cyan via-blue-600 to-cyber-violet text-white font-mono text-xs font-bold shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Lock In Profile & Proceed to Audio Prep</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Live Knowledge Map Preview */}
        <div>
          <GlassPanel className="h-full flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                    Structured Resume Knowledge Map
                  </h3>
                  <p className="text-xs text-slate-400">
                    Extracted claims ready for progressive verification
                  </p>
                </div>
                <NeonBadge
                  label={extractedMap ? "MAP GENERATED" : "STANDBY"}
                  variant={extractedMap ? "emerald" : "obsidian"}
                  size="sm"
                  dot={!!extractedMap}
                />
              </div>

              {extractedMap ? (
                <div className="space-y-4 text-xs font-mono">
                  {/* Skills Grid */}
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2">
                      Identified Skills ({extractedMap.skills.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {extractedMap.skills.map((s: any) => (
                        <span
                          key={s.name}
                          className="px-2.5 py-1 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyan-300 text-[11px]"
                        >
                          {s.name} <span className="opacity-60 text-[9px]">[{s.importance}]</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Prioritized Order */}
                  <div className="p-3.5 rounded-xl bg-obsidian-950/70 border border-white/5 space-y-2">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Targeted Investigation Sequence:
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      {extractedMap.prioritizedInvestigationOrder.map((topic: string, i: number) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Projects */}
                  {extractedMap.projects && extractedMap.projects.length > 0 && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2">
                        Key Projects Tracked
                      </span>
                      {extractedMap.projects.map((p: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 mb-2">
                          <span className="font-semibold text-slate-200">{p.title}</span>
                          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                            {p.technicalClaims?.[0]}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs font-mono">
                    Click &ldquo;Scan & Extract Map&rdquo; or click &ldquo;Proceed&rdquo; to automatically build the candidate&apos;s Knowledge Map.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Candidate: {candidateName}</span>
              <span>Zero-script adaptive engine</span>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
