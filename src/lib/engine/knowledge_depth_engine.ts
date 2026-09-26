export interface DepthEvaluationInput {
  currentDepth: number;
  newEvidenceQuotes: string[];
  missingEvidenceQuotes: string[];
  candidateExplanation: string;
  demonstratedProblemSolving: boolean;
  handledCounterfactual: boolean;
}

export interface DepthEvaluationOutput {
  calculatedDepth: number; // 1 to 5
  depthLabel: string;
  confidence: number;
  evidenceSummary: string;
  missingEvidenceSummary: string;
  status: "NOT_VERIFIED" | "PARTIALLY_VERIFIED" | "VERIFIED" | "CONTRADICTED";
}

export class KnowledgeDepthEngine {
  public static readonly DEPTH_LABELS: Record<number, string> = {
    1: "Level 1: Awareness",
    2: "Level 2: Fundamentals",
    3: "Level 3: Practical Application",
    4: "Level 4: Problem Solving & Edge Cases",
    5: "Level 5: Deep Architecture & Internals",
  };

  /**
   * Evaluates candidate's knowledge depth based on evidence, not keywords
   */
  public static calculateDepth(input: DepthEvaluationInput): DepthEvaluationOutput {
    let depth = Math.max(1, input.currentDepth);

    // If candidate handled a counterfactual or failure scenario with genuine problem solving
    if (input.handledCounterfactual && input.demonstratedProblemSolving) {
      depth = Math.min(5, depth + 1);
    } else if (input.demonstratedProblemSolving && depth < 4) {
      depth = Math.max(3, depth + 1);
    } else if (input.newEvidenceQuotes.length > 0 && depth < 3) {
      depth = 3;
    }

    // Determine confidence based on quantity and specificity of evidence
    const confidence = Math.min(
      0.95,
      0.65 + input.newEvidenceQuotes.length * 0.1 - input.missingEvidenceQuotes.length * 0.05
    );

    const status =
      depth >= 3 ? "VERIFIED" : depth >= 2 ? "PARTIALLY_VERIFIED" : "NOT_VERIFIED";

    return {
      calculatedDepth: depth,
      depthLabel: this.DEPTH_LABELS[depth] || `Level ${depth}`,
      confidence: Math.round(confidence * 100) / 100,
      evidenceSummary: input.newEvidenceQuotes.join("; ") || "General conceptual explanation provided",
      missingEvidenceSummary: input.missingEvidenceQuotes.join("; "),
      status,
    };
  }
}
