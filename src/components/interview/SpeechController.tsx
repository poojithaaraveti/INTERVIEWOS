"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Send, Volume2, Sparkles, RefreshCw } from "lucide-react";
import { NeonBadge } from "../common/NeonBadge";
import { AudioWaveform } from "./AudioWaveform";

// Define SpeechRecognition type for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface SpeechControllerProps {
  questionText: string;
  isAIThinking: boolean;
  onAnswerSubmit: (payload: {
    transcriptText: string;
    speechStartedAt: string;
    speechEndedAt: string;
    responseGapMs: number;
    totalDurationMs: number;
    pauses: Array<{ startOffsetMs: number; durationMs: number }>;
    longestPauseMs: number;
    averagePauseMs: number;
    speechPauseRatio: number;
  }) => void;
}

export function SpeechController({
  questionText,
  isAIThinking,
  onAnswerSubmit,
}: SpeechControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);

  // Timing refs
  const questionDisplayedTime = useRef<number>(Date.now());
  const ttsFinishedTime = useRef<number>(Date.now());
  const speechStartTime = useRef<number | null>(null);
  const speechEndTime = useRef<number | null>(null);
  const pauses = useRef<Array<{ startOffsetMs: number; durationMs: number }>>([]);
  const lastSpeechActivity = useRef<number>(Date.now());
  const recognitionRef = useRef<any>(null);

  // 1. Text-To-Speech for AI Question
  const speakQuestion = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      ttsFinishedTime.current = Date.now();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeakingQuestion(true);
    };

    utterance.onend = () => {
      setIsSpeakingQuestion(false);
      ttsFinishedTime.current = Date.now();
    };

    utterance.onerror = () => {
      setIsSpeakingQuestion(false);
      ttsFinishedTime.current = Date.now();
    };

    window.speechSynthesis.speak(utterance);
  }, [questionText]);

  useEffect(() => {
    questionDisplayedTime.current = Date.now();
    speakQuestion();

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [questionText, speakQuestion]);

  // 2. Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const win = window as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const now = Date.now();
      if (!speechStartTime.current) {
        speechStartTime.current = now;
      }

      // Check if pause occurred since last utterance
      const gapSinceLastActivity = now - lastSpeechActivity.current;
      if (gapSinceLastActivity > 1000 && speechStartTime.current !== now) {
        pauses.current.push({
          startOffsetMs: lastSpeechActivity.current - speechStartTime.current,
          durationMs: gapSinceLastActivity,
        });
      }
      lastSpeechActivity.current = now;

      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript + " ";
      }
      setTranscript(currentTranscript.trim());
    };

    recognition.onerror = (event: any) => {
      console.warn("[SpeechRecognition] error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (isSpeakingQuestion && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      ttsFinishedTime.current = Date.now();
    }

    if (recognitionRef.current) {
      try {
        setTranscript("");
        speechStartTime.current = null;
        pauses.current = [];
        lastSpeechActivity.current = Date.now();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Recognition already active", err);
      }
    } else {
      setIsListening(true);
      speechStartTime.current = Date.now();
    }
  };

  const stopListening = () => {
    speechEndTime.current = Date.now();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn(err);
      }
    }
    setIsListening(false);
  };

  const handleSubmit = () => {
    if (!transcript.trim()) return;

    stopListening();

    const now = Date.now();
    const start = speechStartTime.current || now - 4000;
    const end = speechEndTime.current || now;
    const responseGap = Math.max(0, start - ttsFinishedTime.current);
    const totalDuration = Math.max(1000, end - start);

    // Compute pause metrics
    const pauseDurations = pauses.current.map((p) => p.durationMs);
    const longestPauseMs = pauseDurations.length > 0 ? Math.max(...pauseDurations) : 0;
    const totalPauseTime = pauseDurations.reduce((a, b) => a + b, 0);
    const averagePauseMs =
      pauseDurations.length > 0 ? Math.round(totalPauseTime / pauseDurations.length) : 0;
    const speechPauseRatio =
      totalPauseTime > 0 ? Math.round((totalDuration / totalPauseTime) * 10) / 10 : 5.0;

    onAnswerSubmit({
      transcriptText: transcript.trim(),
      speechStartedAt: new Date(start).toISOString(),
      speechEndedAt: new Date(end).toISOString(),
      responseGapMs: responseGap,
      totalDurationMs: totalDuration,
      pauses: pauses.current,
      longestPauseMs,
      averagePauseMs,
      speechPauseRatio,
    });

    setTranscript("");
  };

  // Helper quick sample answer generator for rapid test evaluation
  const setSampleAnswer = (type: "strong" | "weak" | "inconsistent") => {
    const samples = {
      strong:
        "In our distributed Redis caching layer, we implemented key hashing with TTLs and distributed lock leases via Redlock to completely prevent cache stampedes. When cache invalidation occurred on write events, we published invalidation messages to Kafka, ensuring cluster-wide consistency within 20 milliseconds.",
      weak:
        "Yeah, we just used Redis as a cache. It made our queries faster because in-memory is quicker than SQL.",
      inconsistent:
        "Actually, we only deployed on a single small server with 200 users, so we didn't really need any distributed architecture.",
    };
    setTranscript(samples[type]);
    if (!speechStartTime.current) {
      speechStartTime.current = Date.now() - 3000;
    }
  };

  return (
    <div className="space-y-4">
      {/* Audio Waveform */}
      <AudioWaveform isActive={isListening || isSpeakingQuestion} color={isListening ? "emerald" : "cyan"} />

      {/* Spoken Transcript Area */}
      <div className="relative">
        <textarea
          rows={3}
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            if (!speechStartTime.current) speechStartTime.current = Date.now() - 2000;
          }}
          placeholder={
            isListening
              ? "Listening to your spoken answer... (Speak now)"
              : "Click 'Start Speaking' or type your response here..."
          }
          disabled={isAIThinking}
          className="w-full rounded-xl bg-obsidian-950/70 border border-white/10 p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/30 transition-all font-sans"
        />

        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          {isListening && (
            <NeonBadge label="RECORDING" variant="emerald" dot size="sm" />
          )}
        </div>
      </div>

      {/* Control Buttons & Mic Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isListening ? (
            <button
              onClick={stopListening}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-rose/20 text-rose-300 border border-cyber-rose/40 hover:bg-cyber-rose/30 transition-all font-mono text-xs font-semibold"
            >
              <MicOff className="w-4 h-4" />
              Stop Speaking
            </button>
          ) : (
            <button
              onClick={startListening}
              disabled={isAIThinking}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan/20 to-cyber-violet/20 border border-cyber-cyan/40 text-cyber-cyan hover:shadow-glow transition-all font-mono text-xs font-semibold disabled:opacity-50"
            >
              <Mic className="w-4 h-4" />
              Start Speaking
            </button>
          )}

          <button
            onClick={speakQuestion}
            disabled={isSpeakingQuestion || isAIThinking}
            title="Replay Spoken Question"
            className="p-2 rounded-xl border border-white/10 bg-obsidian-900/60 text-slate-300 hover:text-white hover:border-white/20 transition-all"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Rapid Simulation Presets */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span>Test Answer:</span>
          <button
            type="button"
            onClick={() => setSampleAnswer("strong")}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/20"
          >
            Strong
          </button>
          <button
            type="button"
            onClick={() => setSampleAnswer("weak")}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-amber-400 border border-amber-500/20"
          >
            Weak
          </button>
          <button
            type="button"
            onClick={() => setSampleAnswer("inconsistent")}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-rose-400 border border-rose-500/20"
          >
            Contradict
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!transcript.trim() || isAIThinking}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-white font-mono text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {isAIThinking ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Submit Spoken Answer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
