"use client";

import { useEffect, useRef } from "react";

interface TelemetryMonitorProps {
  interviewId: string;
  contextQuestionId?: string;
  onEventCaptured?: (signalType: string) => void;
}

export function TelemetryMonitor({
  interviewId,
  contextQuestionId,
  onEventCaptured,
}: TelemetryMonitorProps) {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    const sendSignal = async (signalType: string, metadata: Record<string, unknown> = {}) => {
      if (!isMounted.current) return;
      if (onEventCaptured) onEventCaptured(signalType);

      try {
        await fetch(`/api/interviews/${interviewId}/integrity-event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signalType,
            contextQuestionId,
            metadata,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        // Silently log; never interrupt candidate's spoken interview
        console.warn("[TelemetryMonitor] Failed to post integrity signal:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendSignal("TAB_HIDDEN", { reason: "Document visibility set to hidden" });
      } else {
        sendSignal("TAB_VISIBLE", { reason: "Document visibility restored" });
      }
    };

    const handleWindowBlur = () => {
      sendSignal("WINDOW_BLUR", { reason: "Browser window lost focus" });
    };

    const handleWindowFocus = () => {
      sendSignal("WINDOW_FOCUS", { reason: "Browser window regained focus" });
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        sendSignal("FULLSCREEN_EXIT", { reason: "Candidate exited fullscreen" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      isMounted.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [interviewId, contextQuestionId, onEventCaptured]);

  return null; // Invisible observer
}
