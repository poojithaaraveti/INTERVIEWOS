export interface TrackedClaim {
  id: string;
  topic: string;
  category: string;
  importance: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  coverageStatus: "NOT_VERIFIED" | "PARTIALLY_VERIFIED" | "VERIFIED" | "CONTRADICTED";
  verifiedDepth: number;
  confidenceScore: number;
  evidenceQuotes: string[];
  rawClaimText: string;
}

export class ResumeCoverageEngine {
  private static readonly IMPORTANCE_WEIGHTS: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  /**
   * Prioritizes unverified claims intelligently based on importance and verified status
   */
  public static prioritizeClaims(claims: TrackedClaim[]): TrackedClaim[] {
    return [...claims]
      .filter((c) => c.coverageStatus !== "VERIFIED")
      .sort((a, b) => {
        // Contradictions take immediate priority for resolution
        if (a.coverageStatus === "CONTRADICTED" && b.coverageStatus !== "CONTRADICTED") return -1;
        if (b.coverageStatus === "CONTRADICTED" && a.coverageStatus !== "CONTRADICTED") return 1;

        // Partially verified claims need verification depth
        const weightA = this.IMPORTANCE_WEIGHTS[a.importance] || 1;
        const weightB = this.IMPORTANCE_WEIGHTS[b.importance] || 1;

        return weightB - weightA;
      });
  }

  /**
   * Computes overall coverage statistics for recruiter dashboard
   */
  public static computeCoverageMetrics(claims: TrackedClaim[]) {
    const total = claims.length;
    if (total === 0) {
      return {
        totalClaims: 0,
        verifiedCount: 0,
        partiallyVerifiedCount: 0,
        unverifiedCount: 0,
        contradictedCount: 0,
        coveragePercentage: 0,
      };
    }

    const verified = claims.filter((c) => c.coverageStatus === "VERIFIED").length;
    const partial = claims.filter((c) => c.coverageStatus === "PARTIALLY_VERIFIED").length;
    const unverified = claims.filter((c) => c.coverageStatus === "NOT_VERIFIED").length;
    const contradicted = claims.filter((c) => c.coverageStatus === "CONTRADICTED").length;

    // Partial counts as 0.5 for weighted percentage
    const weightedScore = (verified + partial * 0.5) / total;

    return {
      totalClaims: total,
      verifiedCount: verified,
      partiallyVerifiedCount: partial,
      unverifiedCount: unverified,
      contradictedCount: contradicted,
      coveragePercentage: Math.round(weightedScore * 100),
    };
  }
}
