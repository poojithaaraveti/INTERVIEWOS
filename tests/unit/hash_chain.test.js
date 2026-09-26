const test = require("node:test");
const assert = require("node:assert");
const crypto = require("node:crypto");

// Re-implement the exact mathematical functions for Node test verification
const GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

function hashPayload(payload) {
  const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

function computeBlockHash(previousBlockHash, sequenceId, eventType, payloadHash, timestamp) {
  const blockHeader = `${previousBlockHash}|${sequenceId}|${eventType}|${payloadHash}|${timestamp}`;
  return crypto.createHash("sha256").update(blockHeader).digest("hex");
}

function createBlock(previousBlockHash, data) {
  const timestamp = data.timestamp || new Date().toISOString();
  const payloadHash = hashPayload(data.payload);
  const currentBlockHash = computeBlockHash(
    previousBlockHash,
    data.sequenceId,
    data.eventType,
    payloadHash,
    timestamp
  );

  return {
    sequenceId: data.sequenceId,
    eventType: data.eventType,
    payloadHash,
    previousBlockHash,
    currentBlockHash,
    timestamp,
  };
}

function verifyChain(blocks) {
  if (blocks.length === 0) return { isValid: true };
  const sorted = [...blocks].sort((a, b) => a.sequenceId - b.sequenceId);

  const genesis = sorted[0];
  if (genesis.sequenceId !== 0) return { isValid: false, error: "Genesis seq must be 0" };
  if (genesis.previousBlockHash !== GENESIS_PREV_HASH) return { isValid: false, error: "Genesis prev hash invalid" };

  for (let i = 0; i < sorted.length; i++) {
    const block = sorted[i];
    const tsString = block.timestamp instanceof Date ? block.timestamp.toISOString() : block.timestamp;
    const expected = computeBlockHash(
      block.previousBlockHash,
      block.sequenceId,
      block.eventType,
      block.payloadHash,
      tsString
    );

    if (block.currentBlockHash !== expected) {
      return { isValid: false, error: `Block ${block.sequenceId} hash mismatch` };
    }

    if (i > 0) {
      const prev = sorted[i - 1];
      if (block.previousBlockHash !== prev.currentBlockHash) {
        return { isValid: false, error: `Hash link broken between block ${prev.sequenceId} and ${block.sequenceId}` };
      }
    }
  }

  return { isValid: true };
}

test("HashChain: correctly generates and verifies 3-block chain", () => {
  const b0 = createBlock(GENESIS_PREV_HASH, {
    sequenceId: 0,
    eventType: "SESSION_INITIALIZED",
    payload: { id: "test-123" },
    timestamp: "2026-09-26T10:00:00.000Z",
  });

  const b1 = createBlock(b0.currentBlockHash, {
    sequenceId: 1,
    eventType: "QUESTION_GENERATED",
    payload: { text: "Explain Redis" },
    timestamp: "2026-09-26T10:00:05.000Z",
  });

  const b2 = createBlock(b1.currentBlockHash, {
    sequenceId: 2,
    eventType: "ANSWER_SUBMITTED",
    payload: { text: "We used Redis for distributed locks" },
    timestamp: "2026-09-26T10:00:20.000Z",
  });

  const verification = verifyChain([b0, b1, b2]);
  assert.strictEqual(verification.isValid, true);
});

test("HashChain: detects tamper when payload is modified", () => {
  const b0 = createBlock(GENESIS_PREV_HASH, {
    sequenceId: 0,
    eventType: "SESSION_INITIALIZED",
    payload: { id: "test-123" },
    timestamp: "2026-09-26T10:00:00.000Z",
  });

  const b1 = createBlock(b0.currentBlockHash, {
    sequenceId: 1,
    eventType: "QUESTION_GENERATED",
    payload: { text: "Explain Redis" },
    timestamp: "2026-09-26T10:00:05.000Z",
  });

  // Adversary tampers with Block 1 payloadHash
  const tamperedB1 = { ...b1, payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" };

  const verification = verifyChain([b0, tamperedB1]);
  assert.strictEqual(verification.isValid, false);
});
