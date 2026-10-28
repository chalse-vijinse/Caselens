import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOfficerFromRequest, logAuditEvent } from "@/lib/auth";

const reviewSchema = z.object({
  status: z.enum(["CONFIRMED_OVERLAP", "REJECTED"]),
  reviewNotes: z.string().min(3, "Review notes are required").max(1000),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const officer = await getOfficerFromRequest(req);
    if (!officer) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const suggestion = await prisma.overlapSuggestion.findUnique({
      where: { id: params.id },
      include: {
        sourceCase: true,
        targetCase: true,
      },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Overlap suggestion not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const { status, reviewNotes } = parsed.data;

    const updated = await prisma.overlapSuggestion.update({
      where: { id: params.id },
      data: {
        status,
        reviewNotes: reviewNotes.trim(),
        reviewedById: officer.id,
        reviewedAt: new Date(),
      },
      include: {
        reviewedBy: { select: { id: true, name: true, role: true } },
      },
    });

    // Record audit event
    await logAuditEvent({
      userId: officer.id,
      userEmail: officer.email,
      userRole: officer.role,
      action: status === "CONFIRMED_OVERLAP" ? "OVERLAP_CONFIRMED" : "OVERLAP_REJECTED",
      entityType: "OverlapSuggestion",
      entityId: suggestion.id,
      details: {
        sourceCaseId: suggestion.sourceCase.caseId,
        targetCaseId: suggestion.targetCase.caseId,
        similarityScore: suggestion.similarityScore,
        decision: status,
        notes: reviewNotes,
      },
    });

    return NextResponse.json({
      success: true,
      suggestion: updated,
    });
  } catch (err) {
    console.error("Error reviewing overlap:", err);
    return NextResponse.json({ error: "Failed to update overlap review" }, { status: 500 });
  }
}

