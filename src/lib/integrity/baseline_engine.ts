import { CandidateBaselineState, TimingTelemetryPayload } from "../types/telemetry";

export class PersonalBaselineEngine {
  private static readonly CALIBRATION_SAMPLE_THRESHOLD = 2; // Q1 and Q2 establish baseline
  private static readonly Z_SCORE_ELEVATION_THRESHOLD = 2.2; // Soft observation threshold
  private static readonly Z_SCORE_SIGNIFICANT_THRESHOLD = 3.0;

  /**
   * Initializes a fresh baseline state
   */
  public static initialBaseline(): CandidateBaselineState {
    return {
      sampleCount: 0,
      meanLatencyMs: 0,
      varianceLatencyMs: 0,
      stdDevLatencyMs: 0,
      meanPauseMs: 0,
      meanPauseCount: 0,
      isCalibrated: false,
    };
  }

  /**
   * Updates candidate's baseline using Welford's algorithm for online variance
   */
  public static updateBaseline(
    currentBaseline: CandidateBaselineState,
    telemetry: TimingTelemetryPayload
  ): {
    updatedBaseline: CandidateBaselineState;
    zScore: number;
    observation: string | null;
  } {
    const latency = telemetry.responseGapMs;
    const n = currentBaseline.sampleCount + 1;
    
    // In calibration stage
    if (!currentBaseline.isCalibrated) {
      const delta = latency - currentBaseline.meanLatencyMs;
      const newMeanLatency = currentBaseline.meanLatencyMs + delta / n;
      const delta2 = latency - newMeanLatency;
      const newM2 = currentBaseline.varianceLatencyMs * (n - 1) + delta * delta2;
      const newVariance = n > 1 ? newM2 / (n - 1) : 0;
      const newStdDev = Math.sqrt(newVariance);

      const newMeanPauseMs =
        (currentBaseline.meanPauseMs * currentBaseline.sampleCount + telemetry.averagePauseMs) / n;
      const newMeanPauseCount =
        (currentBaseline.meanPauseCount * currentBaseline.sampleCount + telemetry.pauses.length) / n;

      const isCalibrated = n >= this.CALIBRATION_SAMPLE_THRESHOLD;

      const updated: CandidateBaselineState = {
        sampleCount: n,
        meanLatencyMs: Math.round(newMeanLatency),
        varianceLatencyMs: newVariance,
        stdDevLatencyMs: Math.round(newStdDev),
        meanPauseMs: Math.round(newMeanPauseMs),
        meanPauseCount: Math.round(newMeanPauseCount * 10) / 10,
        isCalibrated,
      };

      return {
        updatedBaseline: updated,
        zScore: 0,
        observation: isCalibrated ? "Candidate personal timing baseline calibrated successfully." : null,
      };
    }

    // Active stage: compute Z-Score against calibrated baseline
    // Floor standard deviation at 400ms to avoid hyper-sensitivity if baseline samples were very identical
    const effectiveStdDev = Math.max(currentBaseline.stdDevLatencyMs, 500);
    const zScore = (latency - currentBaseline.meanLatencyMs) / effectiveStdDev;

    let observation: string | null = null;
    if (zScore >= this.Z_SCORE_SIGNIFICANT_THRESHOLD) {
      observation = `Response gap of ${(latency / 1000).toFixed(1)}s represents a marked pause (+${zScore.toFixed(1)}σ) relative to candidate's baseline (${(currentBaseline.meanLatencyMs / 1000).toFixed(1)}s).`;
    } else if (zScore >= this.Z_SCORE_ELEVATION_THRESHOLD) {
      observation = `Response latency moderately elevated (+${zScore.toFixed(1)}σ relative to personal baseline).`;
    }

    return {
      updatedBaseline: currentBaseline,
      zScore: Math.round(zScore * 100) / 100,
      observation,
    };
  }
}
