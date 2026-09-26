import { InterviewStage, QuestionType } from "../types/interview";

export interface StateMachineContext {
  turnNumber: number;
  maxQuestions: number;
  currentStage: InterviewStage;
  currentDifficulty: number;
  lastAssessedDepth?: number;
  hasContradiction: boolean;
  unverifiedCriticalCount: number;
}

export class InterviewStateMachine {
  /**
   * Determines the next interview stage and difficulty based on live performance
   */
  public static transition(context: StateMachineContext): {
    nextStage: InterviewStage;
    nextDifficulty: number;
    recommendedQuestionType: QuestionType;
    isFinished: boolean;
  } {
    const { turnNumber, maxQuestions, currentStage, currentDifficulty, lastAssessedDepth, hasContradiction } =
      context;

    // Check completion condition
    if (turnNumber >= maxQuestions) {
      return {
        nextStage: "COMPLETED",
        nextDifficulty: currentDifficulty,
        recommendedQuestionType: "INTRODUCTORY",
        isFinished: true,
      };
    }

    // Stage 1: Baseline Calibration (Turn 1 to 2)
    if (turnNumber < 2) {
      return {
        nextStage: "BASELINE_CALIBRATION",
        nextDifficulty: 2,
        recommendedQuestionType: turnNumber === 0 ? "INTRODUCTORY" : "TECHNICAL_CONCEPT",
        isFinished: false,
      };
    }

    // Handle immediate contradiction clarification regardless of stage
    if (hasContradiction) {
      return {
        nextStage: currentStage,
        nextDifficulty: currentDifficulty,
        recommendedQuestionType: "CONSISTENCY_CLARIFICATION",
        isFinished: false,
      };
    }

    // Determine adaptive difficulty shift based on last depth
    let nextDifficulty = currentDifficulty;
    if (lastAssessedDepth !== undefined) {
      if (lastAssessedDepth >= 4) {
        nextDifficulty = Math.min(5, currentDifficulty + 1);
      } else if (lastAssessedDepth <= 1) {
        nextDifficulty = Math.max(1, currentDifficulty - 1);
      }
    }

    // Stage 2: Adaptive Investigation (Turns 3 to 7)
    if (turnNumber < Math.floor(maxQuestions * 0.7)) {
      return {
        nextStage: "ADAPTIVE_INVESTIGATION",
        nextDifficulty,
        recommendedQuestionType: "PRACTICAL_EXPERIENCE",
        isFinished: false,
      };
    }

    // Stage 3: Reasoning Challenge (Turns 8+)
    return {
      nextStage: "REASONING_CHALLENGE",
      nextDifficulty: Math.max(nextDifficulty, 4),
      recommendedQuestionType: "COUNTERFACTUAL",
      isFinished: false,
    };
  }
}
