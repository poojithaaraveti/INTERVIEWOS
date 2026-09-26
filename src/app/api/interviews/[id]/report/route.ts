import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const report = await prisma.evaluationReport.findUnique({
      where: { interviewSessionId: id },
      include: {
        interviewSession: {
          include: {
            candidate: { select: { id: true, name: true, email: true } },
            jobRole: true,
            questions: {
              orderBy: { sequenceOrder: "asc" },
              include: { answer: true },
            },
            timingEvents: true,
            integrityEvents: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: { message: "Report not found or interview not yet completed." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        report: {
          ...report,
          strengths: JSON.parse(report.strengthsJson || "[]"),
          knowledgeGaps: JSON.parse(report.knowledgeGapsJson || "[]"),
          verifiedSkills: JSON.parse(report.verifiedSkillsJson || "{}"),
          unverifiedClaims: JSON.parse(report.unverifiedClaimsJson || "[]"),
          reasoningIntegrity: JSON.parse(report.reasoningIntegrityJson || "{}"),
        },
        session: report.interviewSession,
      },
    });
  } catch (error: unknown) {
    console.error("[Report API] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch evaluation report." } },
      { status: 500 }
    );
  }
}
