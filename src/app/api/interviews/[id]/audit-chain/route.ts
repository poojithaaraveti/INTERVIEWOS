import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { HashChainService } from "@/lib/crypto/hash_chain";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const blocks = await prisma.auditHashBlock.findMany({
      where: { interviewSessionId: id },
      orderBy: { sequenceId: "asc" },
    });

    const verification = HashChainService.verifyChain(blocks);

    return NextResponse.json({
      success: true,
      data: {
        isValid: verification.isValid,
        error: verification.error,
        brokenBlockIndex: verification.brokenBlockIndex,
        totalBlocks: blocks.length,
        blocks,
      },
    });
  } catch (error: unknown) {
    console.error("[Audit Chain API] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to verify audit hash chain." } },
      { status: 500 }
    );
  }
}
