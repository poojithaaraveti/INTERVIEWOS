import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        jobRole: true,
        resumeProfile: {
          include: {
            claims: true,
          },
        },
        questions: {
          orderBy: { sequenceOrder: "asc" },
          include: {
            answer: true,
          },
        },
        timingEvents: {
          orderBy: { sequenceOrder: "asc" },
        },
        integrityEvents: {
          orderBy: { timestamp: "desc" },
        },
        evaluationReport: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Interview session not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: unknown) {
    console.error("[Interview Details API] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch interview details." } },
      { status: 500 }
    );
  }
}
