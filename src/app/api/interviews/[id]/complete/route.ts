import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { AIService } from "@/lib/ai/client";
import { HashChainService } from "@/lib/crypto/hash_chain";
import { AnswerEvaluationData } from "@/lib/ai/schemas/answer_eval_schema";

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
        resumeProfile: { include: { claims: true } },
        questions: {
          orderBy: { sequenceOrder: "asc" },
          include: { answer: true },
        },
        skillAssessments: true,
        timingEvents: true,
        integrityEvents: true,
        hashBlocks: {
          orderBy: { sequenceId: "desc" },
          take: 1,
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Interview session not found" } },
        { status: 404 }
      );
    }

    // 1. Compile Q&A transcripts and evaluations
    const qas = session.questions
      .filter((q) => q.answer)
      .map((q) => {
        let evalData: AnswerEvaluationData | null = null;
        try {
          evalData = JSON.parse(q.answer!.evaluationJson);
        } catch {
          // ignore
        }
        return {
          sequenceOrder: q.sequenceOrder,
          question: q.questionText,
          answer: q.answer!.transcriptText,
          topic: q.targetTopic,
          depth: q.answer!.evaluatedDepth,
          evidence: evalData?.demonstratedEvidence || [],
          responseGapMs: q.answer!.responseGapMs,
        };
      });

    // 2. Identify inconsistencies and timing deviations
    const inconsistencies: string[] = [];
    session.questions.forEach((q) => {
      if (q.answer && !q.answer.isConsistent) {
        try {
          const parsed = JSON.parse(q.answer.evaluationJson);
          if (parsed?.consistencyAnalysis?.discrepancyIdentified) {
            inconsistencies.push(parsed.consistencyAnalysis.discrepancyIdentified);
          }
        } catch {
          // ignore
        }
      }
    });

    const timingZMax =
      session.timingEvents.length > 0
        ? Math.max(...session.timingEvents.map((t) => t.deviationFromMean))
        : 0;

    const avgActiveLatency =
      session.timingEvents.filter((t) => t.eventStage === "ACTIVE").length > 0
        ? session.timingEvents
            .filter((t) => t.eventStage === "ACTIVE")
            .reduce((acc, t) => acc + t.latencyMs, 0) /
          session.timingEvents.filter((t) => t.eventStage === "ACTIVE").length
        : session.baselineLatencyMs || 2000;

    // 3. Generate Final Report via AI Synthesis
    const reportData = await AIService.generateFinalReport({
      candidateName: session.candidate.name,
      jobTitle: session.jobRole.title,
      jobDescription: session.jobRole.description,
      totalQuestions: qas.length,
      qas,
      skillAssessments: session.skillAssessments.map((sa) => ({
        skill: sa.skillName,
        depth: sa.assessedDepth,
        evidence: sa.evidenceSummary,
      })),
      inconsistencies,
      integrityObservations: session.integrityEvents.map(
        (e) => `${e.signalType} at ${new Date(e.timestamp).toLocaleTimeString()}`
      ),
      timingSummary: {
        baselineLatencyMs: session.baselineLatencyMs || 2200,
        averageActiveLatencyMs: avgActiveLatency,
        zScoreMax: timingZMax,
      },
    });

    // 4. Save Evaluation Report in DB
    const report = await prisma.evaluationReport.upsert({
      where: { interviewSessionId: session.id },
      update: {
        overallScore: reportData.overallScore,
        roleFitRecommendation: reportData.roleFitRecommendation,
        strengthsJson: JSON.stringify(reportData.strengths),
        knowledgeGapsJson: JSON.stringify(reportData.knowledgeGaps),
        verifiedSkillsJson: JSON.stringify(reportData.verifiedSkills),
        unverifiedClaimsJson: JSON.stringify(reportData.unverifiedClaims),
        consistencyRating: reportData.consistencyRating,
        reasoningIntegrityJson: JSON.stringify(reportData.reasoningIntegrity),
        summaryMarkdown: reportData.summaryMarkdown,
      },
      create: {
        interviewSessionId: session.id,
        overallScore: reportData.overallScore,
        roleFitRecommendation: reportData.roleFitRecommendation,
        strengthsJson: JSON.stringify(reportData.strengths),
        knowledgeGapsJson: JSON.stringify(reportData.knowledgeGaps),
        verifiedSkillsJson: JSON.stringify(reportData.verifiedSkills),
        unverifiedClaimsJson: JSON.stringify(reportData.unverifiedClaims),
        consistencyRating: reportData.consistencyRating,
        reasoningIntegrityJson: JSON.stringify(reportData.reasoningIntegrity),
        summaryMarkdown: reportData.summaryMarkdown,
      },
    });

    // 5. Commit Session Completion to Hash-Chain
    const lastBlockHash = session.hashBlocks[0]?.currentBlockHash || HashChainService.GENESIS_PREV_HASH;
    const nextSeqId = (session.hashBlocks[0]?.sequenceId ?? 0) + 1;

    const completionBlock = HashChainService.createBlock(lastBlockHash, {
      sequenceId: nextSeqId,
      eventType: "SESSION_COMPLETED",
      payload: {
        interviewSessionId: session.id,
        overallScore: reportData.overallScore,
        roleFitRecommendation: reportData.roleFitRecommendation,
        completedAt: new Date().toISOString(),
      },
    });

    await prisma.auditHashBlock.create({
      data: {
        interviewSessionId: session.id,
        sequenceId: completionBlock.sequenceId,
        eventType: completionBlock.eventType,
        payloadHash: completionBlock.payloadHash,
        previousBlockHash: completionBlock.previousBlockHash,
        currentBlockHash: completionBlock.currentBlockHash,
        timestamp: new Date(completionBlock.timestamp),
      },
    });

    // 6. Update Session
    await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        currentStage: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: unknown) {
    console.error("[Interview Complete API] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to finalize interview report" } },
      { status: 500 }
    );
  }
}
