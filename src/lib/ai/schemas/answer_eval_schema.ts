import { z } from "zod";

export const AnswerEvaluationSchema = z.object({
  topicAssessed: z.string().describe("Specific skill or technical topic interrogated in this turn"),
  assessedDepth: z
    .number()
    .min(1)
    .max(5)
    .describe(
      "1: Awareness, 2: Fundamentals, 3: Practical Application, 4: Problem Solving/Failure Modes, 5: Deep Architecture"
    ),
  depthConfidence: z.number().min(0.0).max(1.0).describe("Confidence score in this depth assessment"),
  demonstratedEvidence: z
    .array(z.string())
    .describe("Specific concrete mechanisms, tools, APIs, or architectural decisions stated by candidate"),
  missingOrVagueEvidence: z
    .array(z.string())
    .describe("Gaps, hand-waving, or missing failure handling/trade-offs"),
  claimsAddressed: z.array(
    z.object({
      claimTopic: z.string(),
      newStatus: z.enum(["NOT_VERIFIED", "PARTIALLY_VERIFIED", "VERIFIED", "CONTRADICTED"]),
      depthAchieved: z.number().min(1).max(5),
      supportingEvidence: z.string(),
    })
  ),
  consistencyAnalysis: z.object({
    isConsistentWithPastAnswers: z.boolean().default(true),
    discrepancyIdentified: z.string().nullable().default(null),
    sourceQuestionReferenced: z.string().nullable().default(null),
  }),
  reasoningVerification: z.object({
    demonstratedGenuineReasoning: z
      .boolean()
      .describe("True if explanation reflects first-principles problem-solving, not just memorized keywords"),
    memorizationRisk: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
    reasoningSurvivalNotes: z.string().default("Adequate explanation provided"),
  }),
  recommendedNextAction: z.enum([
    "DRILL_DEEPER_ON_SAME_TOPIC",
    "PIVOT_TO_NEW_UNVERIFIED_CLAIM",
    "CHALLENGE_COUNTERFACTUAL",
    "CLARIFY_POTENTIAL_INCONSISTENCY",
    "SIMPLIFY_TO_REESTABLISH_BASELINE",
  ]),
  suggestedDifficulty: z.number().min(1).max(5).default(2),
});

export type AnswerEvaluationData = z.infer<typeof AnswerEvaluationSchema>;
