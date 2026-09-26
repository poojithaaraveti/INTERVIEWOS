import { z } from "zod";

export const NextQuestionDecisionSchema = z.object({
  questionText: z
    .string()
    .describe("The conversational question to speak to the candidate. Keep it natural and direct."),
  targetTopic: z.string().describe("Specific skill, project, or claim being verified"),
  targetClaimId: z.string().nullable().default(null),
  questionType: z.enum([
    "INTRODUCTORY",
    "TECHNICAL_CONCEPT",
    "PRACTICAL_EXPERIENCE",
    "SYSTEM_DESIGN",
    "REASONING_CHALLENGE",
    "COUNTERFACTUAL",
    "CONSISTENCY_CLARIFICATION",
    "CODE_WALKTHROUGH",
  ]),
  difficulty: z.number().min(1).max(5).default(2),
  intentRationale: z
    .string()
    .describe("Internal justification: why is this question asked given the current interview state?"),
  spokenGuidance: z
    .string()
    .describe("Short conversational phrasing for the voice agent to introduce or bridge into this question"),
});

export type NextQuestionDecisionData = z.infer<typeof NextQuestionDecisionSchema>;
