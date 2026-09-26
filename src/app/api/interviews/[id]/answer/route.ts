import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { HashChainService } from "@/lib/crypto/hash_chain";
import { AIService } from "@/lib/ai/client";
import { PersonalBaselineEngine } from "@/lib/integrity/baseline_engine";
import { InterviewStateMachine } from "@/lib/engine/interview_state_machine";
import { InterviewStage } from "@/lib/types/interview";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      questionId,
      transcriptText,
      speechStartedAt,
      speechEndedAt,
      responseGapMs = 1500,
      totalDurationMs = 5000,
      pauses = [],
      longestPauseMs = 0,
      averagePauseMs = 0,
      speechPauseRatio = 1.0,
    } = body;

    if (!questionId || !transcriptText) {
      return NextResponse.json(
        { success: false, error: { message: "questionId and transcriptText are required." } },
        { status: 400 }
      );
    }

    // 1. Fetch Session with full relational context
    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        candidate: true,
        jobRole: true,
        resumeProfile: {
          include: { claims: true },
        },
        questions: {
          orderBy: { sequenceOrder: "asc" },
          include: { answer: true },
        },
        timingEvents: {
          orderBy: { sequenceOrder: "asc" },
        },
        hashBlocks: {
          orderBy: { sequenceId: "desc" },
          take: 1,
        },
        skillAssessments: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Interview session not found." } },
        { status: 404 }
      );
    }

    const currentQuestion = session.questions.find((q) => q.id === questionId);
    if (!currentQuestion) {
      return NextResponse.json(
        { success: false, error: { message: "Question not found in this session." } },
        { status: 404 }
      );
    }

    // 2. Prepare Prior Q&A context for consistency & depth checks
    const priorQAs = session.questions
      .filter((q) => q.id !== questionId && q.answer)
      .map((q) => ({
        question: q.questionText,
        answer: q.answer!.transcriptText,
        topic: q.targetTopic,
      }));

    const verifiedClaimsContext = session.skillAssessments.map((sa) => ({
      topic: sa.skillName,
      level: sa.assessedDepth,
      evidence: sa.evidenceSummary,
    }));

    // 3. AI Answer Evaluation & Knowledge Depth Scoring (1-5)
    const evaluation = await AIService.evaluateAnswer({
      questionText: currentQuestion.questionText,
      questionTopic: currentQuestion.targetTopic,
      questionDifficulty: currentQuestion.targetDifficulty,
      candidateAnswer: transcriptText,
      targetJobTitle: session.jobRole.title,
      priorQAs,
      verifiedClaims: verifiedClaimsContext,
    });

    // 4. Update Personal Timing Baseline & Calculate Z-Score
    const currentBaselineState = {
      sampleCount: session.timingEvents.length,
      meanLatencyMs: session.baselineLatencyMs || 0,
      varianceLatencyMs: session.baselineVariance || 0,
      stdDevLatencyMs: Math.round(Math.sqrt(session.baselineVariance || 0)),
      meanPauseMs: session.baselinePauseMs || 0,
      meanPauseCount: 0,
      isCalibrated: session.timingEvents.length >= 2,
    };

    const telemetryPayload = {
      questionId,
      sequenceOrder: currentQuestion.sequenceOrder,
      questionDisplayedAt: currentQuestion.displayedAt?.toISOString() || new Date().toISOString(),
      speechStartedAt: speechStartedAt || new Date().toISOString(),
      speechEndedAt: speechEndedAt || new Date().toISOString(),
      responseGapMs: Number(responseGapMs),
      totalAnswerDurationMs: Number(totalDurationMs),
      pauses,
      longestPauseMs: Number(longestPauseMs),
      averagePauseMs: Number(averagePauseMs),
      speechPauseRatio: Number(speechPauseRatio),
    };

    const baselineResult = PersonalBaselineEngine.updateBaseline(
      currentBaselineState,
      telemetryPayload
    );

    // Save Timing Event
    await prisma.timingEvent.create({
      data: {
        interviewSessionId: session.id,
        sequenceOrder: currentQuestion.sequenceOrder,
        eventStage: currentBaselineState.isCalibrated ? "ACTIVE" : "BASELINE",
        latencyMs: Number(responseGapMs),
        pauseCount: pauses.length,
        averagePauseMs: Number(averagePauseMs),
        longestPauseMs: Number(longestPauseMs),
        deviationFromMean: baselineResult.zScore,
        flaggedObservation: baselineResult.observation,
      },
    });

    // 5. Save Answer Record with Structured Evaluation
    const answer = await prisma.answer.create({
      data: {
        questionId: currentQuestion.id,
        transcriptText,
        speechStartedAt: new Date(speechStartedAt || Date.now() - 5000),
        speechEndedAt: new Date(speechEndedAt || Date.now()),
        responseGapMs: Number(responseGapMs),
        totalDurationMs: Number(totalDurationMs),
        pauseCount: pauses.length,
        longestPauseMs: Number(longestPauseMs),
        averagePauseMs: Number(averagePauseMs),
        speechPauseRatio: Number(speechPauseRatio),
        evaluationJson: JSON.stringify(evaluation),
        evaluatedDepth: evaluation.assessedDepth,
        confidenceScore: evaluation.depthConfidence,
        isConsistent: evaluation.consistencyAnalysis.isConsistentWithPastAnswers,
        reasoningSurvival: evaluation.reasoningVerification.demonstratedGenuineReasoning,
      },
    });

    // 6. Update Claim Coverage in ResumeProfile
    for (const claimUpdate of evaluation.claimsAddressed) {
      const existingClaim = session.resumeProfile?.claims.find(
        (c) => c.topic.toLowerCase() === claimUpdate.claimTopic.toLowerCase()
      );

      if (existingClaim) {
        await prisma.resumeClaim.update({
          where: { id: existingClaim.id },
          data: {
            coverageStatus: claimUpdate.newStatus,
            verifiedDepth: Math.max(existingClaim.verifiedDepth, claimUpdate.depthAchieved),
            confidenceScore: evaluation.depthConfidence,
            lastQuestionId: currentQuestion.id,
            evidenceQuotesJson: JSON.stringify([
              ...JSON.parse(existingClaim.evidenceQuotesJson || "[]"),
              claimUpdate.supportingEvidence,
            ]),
          },
        });
      }
    }

    // 7. Update Skill Assessment
    await prisma.skillAssessment.upsert({
      where: {
        interviewSessionId_skillName: {
          interviewSessionId: session.id,
          skillName: currentQuestion.targetTopic,
        },
      },
      update: {
        assessedDepth: evaluation.assessedDepth,
        confidence: evaluation.depthConfidence,
        evidenceSummary: evaluation.demonstratedEvidence.join("; ") || "Demonstrated in discussion",
        missingEvidence: evaluation.missingOrVagueEvidence.join("; "),
      },
      create: {
        interviewSessionId: session.id,
        skillName: currentQuestion.targetTopic,
        assessedDepth: evaluation.assessedDepth,
        confidence: evaluation.depthConfidence,
        evidenceSummary: evaluation.demonstratedEvidence.join("; ") || "Demonstrated in discussion",
        missingEvidence: evaluation.missingOrVagueEvidence.join("; "),
      },
    });

    // 8. Commit Answer to Cryptographic Hash-Chain
    const lastBlockHash = session.hashBlocks[0]?.currentBlockHash || HashChainService.GENESIS_PREV_HASH;
    const nextSeqId = (session.hashBlocks[0]?.sequenceId ?? 0) + 1;

    const answerHashBlock = HashChainService.createBlock(lastBlockHash, {
      sequenceId: nextSeqId,
      eventType: "ANSWER_SUBMITTED",
      payload: {
        questionId: currentQuestion.id,
        answerId: answer.id,
        assessedDepth: evaluation.assessedDepth,
        confidenceScore: evaluation.depthConfidence,
        isConsistent: evaluation.consistencyAnalysis.isConsistentWithPastAnswers,
      },
    });

    await prisma.auditHashBlock.create({
      data: {
        interviewSessionId: session.id,
        sequenceId: answerHashBlock.sequenceId,
        eventType: answerHashBlock.eventType,
        payloadHash: answerHashBlock.payloadHash,
        previousBlockHash: answerHashBlock.previousBlockHash,
        currentBlockHash: answerHashBlock.currentBlockHash,
        timestamp: new Date(answerHashBlock.timestamp),
      },
    });

    // 9. State Machine Transition & Dynamic Next Question
    const transitionDecision = InterviewStateMachine.transition({
      turnNumber: session.questions.length,
      maxQuestions: session.maxQuestions,
      currentStage: session.currentStage as InterviewStage,
      currentDifficulty: session.currentDifficulty,
      lastAssessedDepth: evaluation.assessedDepth,
      hasContradiction: !evaluation.consistencyAnalysis.isConsistentWithPastAnswers,
      unverifiedCriticalCount: session.resumeProfile?.claims.filter(
        (c) => c.importance === "CRITICAL" && c.coverageStatus === "NOT_VERIFIED"
      ).length || 0,
    });

    let nextQuestionRecord = null;

    if (!transitionDecision.isFinished) {
      // Find remaining unverified claims to target next
      const remainingClaims = (session.resumeProfile?.claims || [])
        .filter((c) => c.coverageStatus !== "VERIFIED")
        .map((c) => ({
          topic: c.topic,
          importance: c.importance,
          rawClaimText: c.rawClaimText,
        }));

      const nextQuestionDecision = await AIService.generateNextQuestion({
        interviewStage: transitionDecision.nextStage,
        currentDifficulty: transitionDecision.nextDifficulty,
        recommendedAction: evaluation.recommendedNextAction,
        lastTopic: currentQuestion.targetTopic,
        lastEvaluation: evaluation,
        unverifiedClaims: remainingClaims,
        verifiedClaims: session.skillAssessments.map((sa) => ({
          topic: sa.skillName,
          level: sa.assessedDepth,
        })),
        candidateName: session.candidate.name,
        jobTitle: session.jobRole.title,
        turnNumber: session.questions.length + 1,
      });

      nextQuestionRecord = await prisma.question.create({
        data: {
          interviewSessionId: session.id,
          sequenceOrder: session.questions.length + 1,
          questionText: nextQuestionDecision.questionText,
          questionType: nextQuestionDecision.questionType,
          targetTopic: nextQuestionDecision.targetTopic,
          targetDifficulty: nextQuestionDecision.difficulty,
          intentRationale: nextQuestionDecision.intentRationale,
          displayedAt: new Date(),
        },
      });

      // Commit Next Question to Hash-Chain
      const qBlock = HashChainService.createBlock(answerHashBlock.currentBlockHash, {
        sequenceId: nextSeqId + 1,
        eventType: "QUESTION_GENERATED",
        payload: {
          questionId: nextQuestionRecord.id,
          sequenceOrder: nextQuestionRecord.sequenceOrder,
          questionText: nextQuestionRecord.questionText,
          targetTopic: nextQuestionRecord.targetTopic,
        },
      });

      await prisma.auditHashBlock.create({
        data: {
          interviewSessionId: session.id,
          sequenceId: qBlock.sequenceId,
          eventType: qBlock.eventType,
          payloadHash: qBlock.payloadHash,
          previousBlockHash: qBlock.previousBlockHash,
          currentBlockHash: qBlock.currentBlockHash,
          timestamp: new Date(qBlock.timestamp),
        },
      });
    }

    // 10. Update Interview Session state
    await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        status: transitionDecision.isFinished ? "COMPLETED" : "IN_PROGRESS",
        currentStage: transitionDecision.nextStage,
        currentDifficulty: transitionDecision.nextDifficulty,
        totalQuestions: session.questions.length + (nextQuestionRecord ? 1 : 0),
        baselineLatencyMs: baselineResult.updatedBaseline.meanLatencyMs,
        baselineVariance: baselineResult.updatedBaseline.varianceLatencyMs,
        baselinePauseMs: baselineResult.updatedBaseline.meanPauseMs,
        completedAt: transitionDecision.isFinished ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        evaluation,
        baseline: {
          isCalibrated: baselineResult.updatedBaseline.isCalibrated,
          zScore: baselineResult.zScore,
          observation: baselineResult.observation,
        },
        isFinished: transitionDecision.isFinished,
        nextQuestion: nextQuestionRecord,
        currentStage: transitionDecision.nextStage,
        currentDifficulty: transitionDecision.nextDifficulty,
      },
    });
  } catch (error: unknown) {
    console.error("[Interview Answer API] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to process candidate answer." } },
      { status: 500 }
    );
  }
}
