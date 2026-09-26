import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ResumeKnowledgeMapData } from "@/lib/ai/schemas/resume_schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateEmail, candidateName, jobRoleId, resumeText, knowledgeMap } = body;

    // 1. Ensure Candidate User exists
    const candidate = await prisma.user.upsert({
      where: { email: candidateEmail || "alex.morgan@example.com" },
      update: { name: candidateName || "Alex Morgan" },
      create: {
        email: candidateEmail || "alex.morgan@example.com",
        name: candidateName || "Alex Morgan",
        role: "CANDIDATE",
      },
    });

    // 2. Fetch or create target Job Role
    let role = await prisma.jobRole.findFirst({
      where: jobRoleId ? { id: jobRoleId } : undefined,
    });

    if (!role) {
      role = await prisma.jobRole.findFirst();
    }

    if (!role) {
      return NextResponse.json(
        { success: false, error: { message: "No job roles available." } },
        { status: 400 }
      );
    }

    // 3. Create Interview Session
    const session = await prisma.interviewSession.create({
      data: {
        candidateId: candidate.id,
        jobRoleId: role.id,
        status: "CREATED",
        currentStage: "INITIALIZED",
        currentDifficulty: 2,
        totalQuestions: 0,
        maxQuestions: 8,
      },
    });

    // 4. Create ResumeProfile & ResumeClaims
    const parsedData: ResumeKnowledgeMapData = knowledgeMap;
    const resumeProfile = await prisma.resumeProfile.create({
      data: {
        interviewSessionId: session.id,
        rawText: resumeText || "",
        parsedDataJson: JSON.stringify(parsedData),
      },
    });

    // 5. Ingest individual claims for rigorous tracking
    if (parsedData?.skills) {
      for (const skill of parsedData.skills) {
        await prisma.resumeClaim.create({
          data: {
            resumeProfileId: resumeProfile.id,
            category: "SKILL",
            topic: skill.name,
            rawClaimText: `Claimed ${skill.claimedLevel} proficiency in ${skill.name}`,
            claimedLevel: skill.claimedLevel,
            importance: skill.importance.toUpperCase(),
            coverageStatus: "NOT_VERIFIED",
            verifiedDepth: 0,
            confidenceScore: 0.0,
          },
        });
      }
    }

    if (parsedData?.projects) {
      for (const project of parsedData.projects) {
        await prisma.resumeClaim.create({
          data: {
            resumeProfileId: resumeProfile.id,
            category: "PROJECT",
            topic: project.title,
            rawClaimText: project.technicalClaims?.[0] || project.title,
            importance: "HIGH",
            coverageStatus: "NOT_VERIFIED",
            verifiedDepth: 0,
            confidenceScore: 0.0,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        interviewId: session.id,
        status: session.status,
        candidateName: candidate.name,
        jobTitle: role.title,
      },
    });
  } catch (error: unknown) {
    console.error("[Interviews API] Error creating interview:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create interview session" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const interviews = await prisma.interviewSession.findMany({
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        jobRole: { select: { id: true, title: true, seniorityLevel: true } },
        evaluationReport: {
          select: {
            overallScore: true,
            roleFitRecommendation: true,
            consistencyRating: true,
          },
        },
        _count: { select: { questions: true, integrityEvents: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: interviews,
    });
  } catch (error: unknown) {
    console.error("[Interviews API] Error fetching interviews:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch interviews" } },
      { status: 500 }
    );
  }
}
