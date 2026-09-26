export type KnowledgeImportance = "low" | "medium" | "high" | "critical";

export type ClaimedLevel = "awareness" | "foundational" | "proficient" | "advanced" | "expert";

export type CoverageStatus = "NOT_VERIFIED" | "PARTIALLY_VERIFIED" | "VERIFIED" | "CONTRADICTED";

export type QuestionType =
  | "INTRODUCTORY"
  | "TECHNICAL_CONCEPT"
  | "PRACTICAL_EXPERIENCE"
  | "SYSTEM_DESIGN"
  | "REASONING_CHALLENGE"
  | "COUNTERFACTUAL"
  | "CONSISTENCY_CLARIFICATION"
  | "CODE_WALKTHROUGH";

export type InterviewStage =
  | "INITIALIZED"
  | "BASELINE_CALIBRATION"
  | "ADAPTIVE_INVESTIGATION"
  | "REASONING_CHALLENGE"
  | "EVALUATION_SYNTHESIS"
  | "COMPLETED";

export interface SkillItem {
  name: string;
  category: "frontend" | "backend" | "database" | "devops" | "ai_ml" | "architecture" | "soft_skill" | "other";
  importance: KnowledgeImportance;
  claimedLevel: ClaimedLevel;
  verifiedLevel: number | null; // 1-5 scale
  coverage: boolean;
  coverageStatus: CoverageStatus;
  evidenceQuotes?: string[];
}

export interface ProjectClaimItem {
  title: string;
  role?: string;
  claimedTechnologies: string[];
  keyAchievements: string[];
  technicalClaims: string[];
  coverage: boolean;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration?: string;
  responsibilities: string[];
  claimedOutcomes: string[];
}

export interface ResumeKnowledgeMap {
  candidateName: string;
  headline?: string;
  yearsOfExperience: number | null;
  skills: SkillItem[];
  projects: ProjectClaimItem[];
  experience: ExperienceItem[];
  certifications: Array<{
    name: string;
    issuer?: string;
    year?: string;
    coverage: boolean;
  }>;
  prioritizedInvestigationOrder: string[];
}

export interface NextQuestionDecision {
  questionText: string;
  targetTopic: string;
  targetClaimId: string | null;
  questionType: QuestionType;
  difficulty: number; // 1 to 5
  intentRationale: string;
  spokenGuidance: string;
}

export interface AnswerEvaluationResult {
  topicAssessed: string;
  assessedDepth: number; // 1 to 5
  depthConfidence: number; // 0.0 to 1.0
  demonstratedEvidence: string[];
  missingOrVagueEvidence: string[];
  claimsAddressed: Array<{
    claimTopic: string;
    newStatus: CoverageStatus;
    depthAchieved: number;
    supportingEvidence: string;
  }>;
  consistencyAnalysis: {
    isConsistentWithPastAnswers: boolean;
    discrepancyIdentified: string | null;
    sourceQuestionReferenced: string | null;
  };
  reasoningVerification: {
    demonstratedGenuineReasoning: boolean;
    memorizationRisk: "LOW" | "MEDIUM" | "HIGH";
    reasoningSurvivalNotes: string;
  };
  recommendedNextAction:
    | "DRILL_DEEPER_ON_SAME_TOPIC"
    | "PIVOT_TO_NEW_UNVERIFIED_CLAIM"
    | "CHALLENGE_COUNTERFACTUAL"
    | "CLARIFY_POTENTIAL_INCONSISTENCY"
    | "SIMPLIFY_TO_REESTABLISH_BASELINE";
  suggestedDifficulty: number;
}
