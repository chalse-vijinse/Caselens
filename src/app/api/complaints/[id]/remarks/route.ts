import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOfficerFromRequest, logAuditEvent } from "@/lib/auth";

const remarkSchema = z.object({
  remark: z.string().min(2, "Remark must be at least 2 characters").max(2000),
  isInternal: z.boolean().default(true),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const officer = await getOfficerFromRequest(req);
    if (!officer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [{ id: params.id }, { caseId: params.id }],
      },
      include: { institution: true },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Role-based regional scoping check
    if (officer.role === "REGIONAL_OFFICER" && officer.region) {
      if (!complaint.institution.region.toLowerCase().includes(officer.region.toLowerCase())) {
        return NextResponse.json(
          { error: `Forbidden: Regional officers can only remark on cases within their region.` },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const parsed = remarkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const remark = await prisma.caseRemark.create({
      data: {
        caseId: complaint.id,
        userId: officer.id,
        remark: parsed.data.remark.trim(),
        isInternal: parsed.data.isInternal,
      },
      include: {
        user: { select: { id: true, name: true, role: true, department: true } },
      },
    });

    await logAuditEvent({
      userId: officer.id,
      userEmail: officer.email,
      userRole: officer.role,
      action: "REMARK_ADDED",
      entityType: "Complaint",
      entityId: complaint.id,
      details: { caseId: complaint.caseId, remarkLength: remark.remark.length },
    });

    return NextResponse.json({
      success: true,
      remark,
    });
  } catch (err) {
    console.error("Error creating remark:", err);
    return NextResponse.json({ error: "Failed to add remark" }, { status: 500 });
  }
}

