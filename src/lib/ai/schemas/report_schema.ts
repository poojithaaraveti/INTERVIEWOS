import { z } from "zod";

export const FinalEvaluationReportSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("Overall holistic evaluation percentage"),
  roleFitRecommendation: z.enum([
    "STRONG_FIT",
    "POTENTIAL_FIT",
    "GAP_IDENTIFIED",
    "INSUFFICIENT_EVIDENCE",
  ]),
  roleFitRationale: z.string(),
  strengths: z.array(z.string()).describe("Specific verified technical proficiencies with evidence"),
  knowledgeGaps: z.array(z.string()).describe("Unsubstantiated or failed depth areas"),
  verifiedSkills: z.record(
    z.string(),
    z.object({
      depth: z.number().min(1).max(5),
      depthLabel: z.string(),
      evidence: z.string(),
    })
  ),
  unverifiedClaims: z.array(z.string()),
  consistencyRating: z.enum(["HIGH", "MODERATE", "LOW"]),
  reasoningIntegrity: z.object({
    crossQuestionConsistency: z.enum(["HIGH", "MODERATE", "LOW"]),
    reasoningDepthScore: z.enum(["HIGH", "MODERATE", "FOUNDATIONAL"]),
    rephraseSurvivalAbility: z.enum(["HIGH", "MODERATE", "FRAGILE"]),
    timingPatternObservation: z.enum([
      "NORMAL_BASELINE",
      "MODERATE_DEVIATION",
      "HIGH_LATENCY_VARIANCE",
    ]),
    languagePatternShift: z.enum([
      "CONSISTENT_STYLE",
      "SLIGHT_STYLE_SHIFT",
      "SUBSTANTIAL_SHIFT",
    ]),
    browserIntegrityStatus: z.enum(["CLEAN", "FEW_INTERRUPTIONS", "FREQUENT_DEFOCUS"]),
    verificationConfidenceScore: z.number().min(0).max(100),
    transparentObservations: z.array(z.string()),
  }),
  summaryMarkdown: z.string().describe("Comprehensive, executive multi-paragraph debrief"),
});

export type FinalEvaluationReportData = z.infer<typeof FinalEvaluationReportSchema>;
