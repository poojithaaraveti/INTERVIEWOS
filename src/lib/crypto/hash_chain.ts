import crypto from "crypto";

export interface HashBlockData {
  sequenceId: number;
  eventType: string;
  payload: unknown;
  timestamp?: string; // ISO string
}

export interface HashBlockResult {
  sequenceId: number;
  eventType: string;
  payloadHash: string;
  previousBlockHash: string;
  currentBlockHash: string;
  timestamp: string;
}

export class HashChainService {
  public static readonly GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

  /**
   * Generates a deterministic SHA-256 hash for any payload object
   */
  public static hashPayload(payload: unknown): string {
    const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  /**
   * Computes the block hash from its cryptographic components:
   * BlockHash = SHA-256(previousBlockHash | sequenceId | eventType | payloadHash | timestamp)
   */
  public static computeBlockHash(
    previousBlockHash: string,
    sequenceId: number,
    eventType: string,
    payloadHash: string,
    timestamp: string
  ): string {
    const blockHeader = `${previousBlockHash}|${sequenceId}|${eventType}|${payloadHash}|${timestamp}`;
    return crypto.createHash("sha256").update(blockHeader).digest("hex");
  }

  /**
   * Creates a new block to append to the chain
   */
  public static createBlock(
    previousBlockHash: string,
    data: HashBlockData
  ): HashBlockResult {
    const timestamp = data.timestamp || new Date().toISOString();
    const payloadHash = this.hashPayload(data.payload);
    const currentBlockHash = this.computeBlockHash(
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

  /**
   * Validates an entire array of blocks.
   * Returns `{ isValid: true }` or details of the first broken link or corrupted payload.
   */
  public static verifyChain(
    blocks: Array<{
      sequenceId: number;
      eventType: string;
      payloadHash: string;
      previousBlockHash: string;
      currentBlockHash: string;
      timestamp: Date | string;
    }>
  ): { isValid: boolean; error?: string; brokenBlockIndex?: number } {
    if (blocks.length === 0) {
      return { isValid: true };
    }

    // Sort by sequenceId
    const sorted = [...blocks].sort((a, b) => a.sequenceId - b.sequenceId);

    // Verify Genesis Block
    const genesis = sorted[0];
    if (genesis.sequenceId !== 0) {
      return {
        isValid: false,
        error: `Genesis block must have sequenceId 0, found ${genesis.sequenceId}`,
        brokenBlockIndex: 0,
      };
    }

    if (genesis.previousBlockHash !== this.GENESIS_PREV_HASH) {
      return {
        isValid: false,
        error: `Genesis block previous hash does not match standard genesis seed`,
        brokenBlockIndex: 0,
      };
    }

    // Verify each block in sequence
    for (let i = 0; i < sorted.length; i++) {
      const block = sorted[i];
      const tsString = block.timestamp instanceof Date ? block.timestamp.toISOString() : block.timestamp;
      
      const expectedHash = this.computeBlockHash(
        block.previousBlockHash,
        block.sequenceId,
        block.eventType,
        block.payloadHash,
        tsString
      );

      if (block.currentBlockHash !== expectedHash) {
        return {
          isValid: false,
          error: `Block ${block.sequenceId} hash mismatch. Computed: ${expectedHash}, Recorded: ${block.currentBlockHash}`,
          brokenBlockIndex: i,
        };
      }

      if (i > 0) {
        const prevBlock = sorted[i - 1];
        if (block.previousBlockHash !== prevBlock.currentBlockHash) {
          return {
            isValid: false,
            error: `Chain broken between Block ${prevBlock.sequenceId} and Block ${block.sequenceId}. Hash link mismatch.`,
            brokenBlockIndex: i,
          };
        }
      }
    }

    return { isValid: true };
  }
}
