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
        questions: true,
        hashBlocks: {
          orderBy: { sequenceId: "desc" },
          take: 1,
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Interview session not found." } },
        { status: 404 }
      );
    }

    // 1. If already started and questions exist, return current question
    if (session.questions.length > 0 && session.status === "IN_PROGRESS") {
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
    let latestBlockHash = HashChainService.GENESIS_PREV_HASH;
    let nextSequenceId = 0;

    if (session.hashBlocks.length === 0) {
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

      await prisma.auditHashBlock.create({
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

      latestBlockHash = genesisBlock.currentBlockHash;
      nextSequenceId = 1;
    } else {
      latestBlockHash = session.hashBlocks[0].currentBlockHash;
      nextSequenceId = session.hashBlocks[0].sequenceId + 1;
    }

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

    // 6. Commit Block to Hash-Chain
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
