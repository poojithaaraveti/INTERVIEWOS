import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ResumeKnowledgeMapData } from "@/lib/ai/schemas/resume_schema";
import { AIService } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateEmail, candidateName, jobRoleId, jobTitle, jobDescription, resumeText, knowledgeMap } = body;

    const email = candidateEmail?.trim() || "alex.morgan@example.com";
    const name = candidateName?.trim() || "Alex Morgan";
    const targetTitle = jobTitle?.trim() || "Senior Distributed Systems Engineer";
    const targetDesc = jobDescription?.trim() || "Architect high-performance distributed systems, database optimization, and resilient APIs.";

    // 1. Ensure Candidate User exists
    const candidate = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        role: "CANDIDATE",
      },
    });

    // 2. Fetch or dynamically create target Job Role
    let role = null;
    if (jobRoleId) {
      role = await prisma.jobRole.findUnique({
        where: { id: jobRoleId },
      });
    }

    if (!role) {
      role = await prisma.jobRole.findFirst({
        where: { title: targetTitle },
      });
    }

    if (!role) {
      // Find a recruiter user to associate with, or use a default one
      let recruiter = await prisma.user.findFirst({
        where: { role: "RECRUITER" },
      });

      if (!recruiter) {
        recruiter = await prisma.user.create({
          data: {
            email: "sarah.chen@interviewos.ai",
            name: "Sarah Chen",
            role: "RECRUITER",
          },
        });
      }

      role = await prisma.jobRole.create({
        data: {
          title: targetTitle,
          description: targetDesc,
          seniorityLevel: "Senior",
          requiredSkills: JSON.stringify(["Distributed Systems", "Architecture", "Problem Solving"]),
          recruiterId: recruiter.id,
        },
      });
    }

    // 3. Ensure we have a valid structured knowledge map
    let parsedData: ResumeKnowledgeMapData = knowledgeMap;
    if (!parsedData || !parsedData.skills || parsedData.skills.length === 0) {
      parsedData = await AIService.parseResume(resumeText || "", role.title, role.description);
    }

    // 4. Create Interview Session
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

    // 5. Create ResumeProfile
    const resumeProfile = await prisma.resumeProfile.create({
      data: {
        interviewSessionId: session.id,
        rawText: resumeText || "",
        parsedDataJson: JSON.stringify(parsedData),
      },
    });

    // 6. Ingest individual claims safely for rigorous tracking
    if (Array.isArray(parsedData?.skills)) {
      for (const skill of parsedData.skills) {
        const topic = skill?.name?.trim() || "Core Skill";
        const importance = (typeof skill?.importance === "string" ? skill.importance : "MEDIUM").toUpperCase();
        const validImportance = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(importance) ? importance : "MEDIUM";
        const claimedLevel = typeof skill?.claimedLevel === "string" ? skill.claimedLevel : "proficient";

        await prisma.resumeClaim.create({
          data: {
            resumeProfileId: resumeProfile.id,
            category: "SKILL",
            topic,
            rawClaimText: `Claimed ${claimedLevel} proficiency in ${topic}`,
            claimedLevel,
            importance: validImportance,
            coverageStatus: "NOT_VERIFIED",
            verifiedDepth: 0,
            confidenceScore: 0.0,
          },
        });
      }
    }

    if (Array.isArray(parsedData?.projects)) {
      for (const project of parsedData.projects) {
        const topic = project?.title?.trim() || "Project";
        const rawClaimText =
          Array.isArray(project?.technicalClaims) && project.technicalClaims[0]
            ? project.technicalClaims[0]
            : topic;

        await prisma.resumeClaim.create({
          data: {
            resumeProfileId: resumeProfile.id,
            category: "PROJECT",
            topic,
            rawClaimText,
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
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Failed to create interview session",
        },
      },
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
