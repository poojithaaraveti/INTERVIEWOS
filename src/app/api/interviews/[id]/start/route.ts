import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { HashChainService } from "@/lib/crypto/hash_chain";
import { AIService } from "@/lib/ai/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Interview session not found." } },
        { status: 404 }
      );
    }

    // 1. If questions already exist, return the current question immediately (idempotent)
    if (session.questions.length > 0) {
      const latestQuestion = session.questions[session.questions.length - 1];
      return NextResponse.json({
        success: true,
        data: {
          question: latestQuestion,
          status: session.status,
          currentStage: session.currentStage,
          currentDifficulty: session.currentDifficulty,
        },
      });
    }

    // 2. Initialize Genesis Hash Block if not present
    let latestBlock = await prisma.auditHashBlock.findFirst({
      where: { interviewSessionId: session.id },
      orderBy: { sequenceId: "desc" },
    });

    if (!latestBlock) {
      const genesisBlock = HashChainService.createBlock(HashChainService.GENESIS_PREV_HASH, {
        sequenceId: 0,
        eventType: "SESSION_INITIALIZED",
        payload: {
          interviewId: session.id,
          candidateEmail: session.candidate.email,
          jobTitle: session.jobRole.title,
          initializedAt: new Date().toISOString(),
        },
      });

      try {
        latestBlock = await prisma.auditHashBlock.create({
          data: {
            interviewSessionId: session.id,
            sequenceId: genesisBlock.sequenceId,
            eventType: genesisBlock.eventType,
            payloadHash: genesisBlock.payloadHash,
            previousBlockHash: genesisBlock.previousBlockHash,
            currentBlockHash: genesisBlock.currentBlockHash,
            timestamp: new Date(genesisBlock.timestamp),
          },
        });
      } catch (e: any) {
        // In case of concurrent call, fetch existing block
        latestBlock = await prisma.auditHashBlock.findFirst({
          where: { interviewSessionId: session.id },
          orderBy: { sequenceId: "desc" },
        });
      }
    }

    const latestBlockHash = latestBlock?.currentBlockHash || HashChainService.GENESIS_PREV_HASH;
    const nextSequenceId = (latestBlock?.sequenceId ?? 0) + 1;

    // 3. Generate Turn 1 Question (Personal Baseline Calibration)
    const unverifiedClaims = session.resumeProfile?.claims.map((c) => ({
      topic: c.topic,
      importance: c.importance,
      rawClaimText: c.rawClaimText,
    })) || [];

    const firstQuestionDecision = await AIService.generateNextQuestion({
      interviewStage: "BASELINE_CALIBRATION",
      currentDifficulty: 2,
      recommendedAction: "DRILL_DEEPER_ON_SAME_TOPIC",
      lastTopic: "Overview",
      unverifiedClaims,
      verifiedClaims: [],
      candidateName: session.candidate.name,
      jobTitle: session.jobRole.title,
      turnNumber: 1,
    });

    // 4. Save Question to Database
    const question = await prisma.question.create({
      data: {
        interviewSessionId: session.id,
        sequenceOrder: 1,
        questionText: firstQuestionDecision.questionText,
        questionType: firstQuestionDecision.questionType,
        targetTopic: firstQuestionDecision.targetTopic,
        targetDifficulty: firstQuestionDecision.difficulty,
        intentRationale: firstQuestionDecision.intentRationale,
        displayedAt: new Date(),
      },
    });

    // 5. Update Session Status
    await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        status: "IN_PROGRESS",
        currentStage: "BASELINE_CALIBRATION",
        currentDifficulty: firstQuestionDecision.difficulty,
        totalQuestions: 1,
        startedAt: session.startedAt || new Date(),
      },
    });

    // 6. Commit Block to Hash-Chain safely
    try {
      const qBlock = HashChainService.createBlock(latestBlockHash, {
        sequenceId: nextSequenceId,
        eventType: "QUESTION_GENERATED",
        payload: {
          questionId: question.id,
          sequenceOrder: question.sequenceOrder,
          questionText: question.questionText,
          targetTopic: question.targetTopic,
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
    } catch (err) {
      console.warn("[Interview Start API] Non-fatal hash block link warning:", err);
    }

    return NextResponse.json({
      success: true,
      data: {
        question,
        status: "IN_PROGRESS",
        currentStage: "BASELINE_CALIBRATION",
        currentDifficulty: firstQuestionDecision.difficulty,
      },
    });
  } catch (error: unknown) {
    console.error("[Interview Start API] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to start interview session." } },
      { status: 500 }
    );
  }
}
