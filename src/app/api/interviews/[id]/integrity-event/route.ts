import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { HashChainService } from "@/lib/crypto/hash_chain";
import { IntegritySignalType } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { signalType, contextQuestionId, metadata = {} } = body;

    if (!signalType) {
      return NextResponse.json(
        { success: false, error: { message: "signalType is required" } },
        { status: 400 }
      );
    }

    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
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

    // 1. Record Integrity Event
    const event = await prisma.integrityEvent.create({
      data: {
        interviewSessionId: session.id,
        signalType: signalType as IntegritySignalType,
        metadataJson: JSON.stringify(metadata),
        contextQuestionId,
        timestamp: new Date(),
      },
    });

    // 2. Commit Event to Cryptographic Hash-Chain
    const lastBlockHash = session.hashBlocks[0]?.currentBlockHash || HashChainService.GENESIS_PREV_HASH;
    const nextSeqId = (session.hashBlocks[0]?.sequenceId ?? 0) + 1;

    const block = HashChainService.createBlock(lastBlockHash, {
      sequenceId: nextSeqId,
      eventType: `INTEGRITY_${signalType}`,
      payload: {
        eventId: event.id,
        signalType,
        contextQuestionId,
        metadata,
      },
    });

    await prisma.auditHashBlock.create({
      data: {
        interviewSessionId: session.id,
        sequenceId: block.sequenceId,
        eventType: block.eventType,
        payloadHash: block.payloadHash,
        previousBlockHash: block.previousBlockHash,
        currentBlockHash: block.currentBlockHash,
        timestamp: new Date(block.timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        eventId: event.id,
        blockHash: block.currentBlockHash,
      },
    });
  } catch (error: unknown) {
    console.error("[Integrity Event API] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to record integrity event" } },
      { status: 500 }
    );
  }
}
