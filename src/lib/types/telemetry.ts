export type IntegritySignalType =
  | "TAB_HIDDEN"
  | "TAB_VISIBLE"
  | "WINDOW_BLUR"
  | "WINDOW_FOCUS"
  | "FULLSCREEN_EXIT"
  | "MIC_DISCONNECTED"
  | "AUDIO_DEVICE_CHANGED"
  | "RAPID_PASTE_ATTEMPT";

export interface TimingTelemetryPayload {
  questionId: string;
  sequenceOrder: number;
  questionDisplayedAt: string; // ISO
  ttsFinishedAt?: string; // ISO
  speechStartedAt: string; // ISO
  speechEndedAt: string; // ISO
  responseGapMs: number;
  totalAnswerDurationMs: number;
  pauses: Array<{
    startOffsetMs: number;
    durationMs: number;
  }>;
  longestPauseMs: number;
  averagePauseMs: number;
  speechPauseRatio: number;
}

export interface CandidateBaselineState {
  sampleCount: number;
  meanLatencyMs: number;
  varianceLatencyMs: number;
  stdDevLatencyMs: number;
  meanPauseMs: number;
  meanPauseCount: number;
  isCalibrated: boolean;
}

export interface IntegrityEventPayload {
  signalType: IntegritySignalType;
  timestamp: string; // ISO
  contextQuestionId?: string;
  metadata?: Record<string, unknown>;
}

export interface ReasoningIntegritySummary {
  crossQuestionConsistency: "HIGH" | "MODERATE" | "LOW";
  reasoningDepthScore: "HIGH" | "MODERATE" | "FOUNDATIONAL";
  rephraseSurvivalAbility: "HIGH" | "MODERATE" | "FRAGILE";
  timingPatternObservation: "NORMAL_BASELINE" | "MODERATE_DEVIATION" | "HIGH_LATENCY_VARIANCE";
  languagePatternShift: "CONSISTENT_STYLE" | "SLIGHT_STYLE_SHIFT" | "SUBSTANTIAL_SHIFT";
  browserIntegrityStatus: "CLEAN" | "FEW_INTERRUPTIONS" | "FREQUENT_DEFOCUS";
  verificationConfidenceScore: number; // 0 to 100 percentage
  transparentObservations: string[]; // Factual notes, never accusatory
}
