const test = require("node:test");
const assert = require("node:assert");

// Standalone baseline verification
function initialBaseline() {
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

function updateBaseline(current, latency, averagePause = 1000) {
  const n = current.sampleCount + 1;
  if (!current.isCalibrated) {
    const delta = latency - current.meanLatencyMs;
    const newMean = current.meanLatencyMs + delta / n;
    const delta2 = latency - newMean;
    const newM2 = current.varianceLatencyMs * (n - 1) + delta * delta2;
    const newVariance = n > 1 ? newM2 / (n - 1) : 0;
    const newStdDev = Math.sqrt(newVariance);

    return {
      updated: {
        sampleCount: n,
        meanLatencyMs: Math.round(newMean),
        varianceLatencyMs: newVariance,
        stdDevLatencyMs: Math.round(newStdDev),
        meanPauseMs: averagePause,
        meanPauseCount: 1,
        isCalibrated: n >= 2,
      },
      zScore: 0,
    };
  }

  const effectiveStd = Math.max(current.stdDevLatencyMs, 500);
  const z = (latency - current.meanLatencyMs) / effectiveStd;
  return {
    updated: current,
    zScore: Math.round(z * 100) / 100,
  };
}

test("PersonalBaselineEngine: calibrates after 2 samples", () => {
  let state = initialBaseline();
  assert.strictEqual(state.isCalibrated, false);

  // Turn 1: 2000ms latency
  const step1 = updateBaseline(state, 2000);
  state = step1.updated;
  assert.strictEqual(state.sampleCount, 1);
  assert.strictEqual(state.isCalibrated, false);

  // Turn 2: 2400ms latency
  const step2 = updateBaseline(state, 2400);
  state = step2.updated;
  assert.strictEqual(state.sampleCount, 2);
  assert.strictEqual(state.isCalibrated, true);
  assert.strictEqual(state.meanLatencyMs, 2200);
});

test("PersonalBaselineEngine: computes positive Z-score deviation for large latency spike", () => {
  let state = {
    sampleCount: 2,
    meanLatencyMs: 2000,
    varianceLatencyMs: 40000,
    stdDevLatencyMs: 200,
    meanPauseMs: 1000,
    meanPauseCount: 1,
    isCalibrated: true,
  };

  // Turn 3 has latency of 3500ms
  const step3 = updateBaseline(state, 3500);
  assert.strictEqual(step3.zScore > 2.0, true);
});
