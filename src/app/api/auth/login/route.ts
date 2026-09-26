import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: "Email is required" } },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: email.split("@")[0].replace(".", " "),
        role: role === "RECRUITER" ? "RECRUITER" : "CANDIDATE",
      },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set HTTP-only cookie for session identity
    response.cookies.set("interviewos_user", JSON.stringify({ id: user.id, role: user.role }), {
      httpOnly: false, // Accessible to client for easy role toggling in hackathon prototype
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error: unknown) {
    console.error("[Auth API] Login error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Authentication failed" } },
      { status: 500 }
    );
  }
}
