import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, jobTitle, jobDescription } = body;

    if (!resumeText || !jobTitle) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Resume text and target job title are required." },
        },
        { status: 400 }
      );
    }

    const knowledgeMap = await AIService.parseResume(
      resumeText,
      jobTitle,
      jobDescription || "Standard software engineering responsibilities."
    );

    return NextResponse.json({
      success: true,
      data: knowledgeMap,
    });
  } catch (error: unknown) {
    console.error("[Resume Parse API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to extract structured knowledge map from resume." },
      },
      { status: 500 }
    );
  }
}
