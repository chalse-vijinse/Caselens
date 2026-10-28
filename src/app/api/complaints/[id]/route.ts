import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOfficerFromRequest, logAuditEvent } from "@/lib/auth";

const patchCaseSchema = z.object({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  department: z.string().optional(),
  assignedOfficerId: z.string().optional().nullable(),
  resolutionNotes: z.string().optional().nullable(),
  reason: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const officer = await getOfficerFromRequest(req);
    if (!officer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [{ id: params.id }, { caseId: params.id }],
      },
      include: {
        institution: true,
        assignedOfficer: {
          select: { id: true, name: true, email: true, role: true, department: true },
        },
        remarks: {
          include: {
            user: { select: { id: true, name: true, role: true, department: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        statusHistory: {
          include: {
            changedBy: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        sourceOverlaps: {
          include: {
            targetCase: {
              include: { institution: { select: { name: true, region: true } } },
            },
          },
          orderBy: { similarityScore: "desc" },
        },
        targetOverlaps: {
          include: {
            sourceCase: {
              include: { institution: { select: { name: true, region: true } } },
            },
          },
          orderBy: { similarityScore: "desc" },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Role-based regional scoping check
    if (officer.role === "REGIONAL_OFFICER" && officer.region) {
      if (!complaint.institution.region.toLowerCase().includes(officer.region.toLowerCase())) {
        return NextResponse.json(
          { error: `Forbidden: Regional officers can only access cases within their assigned region (${officer.region}).` },
          { status: 403 }
        );
      }
    }

    // Combine source and target overlaps for complete bidirectional overlap display
    const overlaps = [
      ...complaint.sourceOverlaps.map((o) => ({
        id: o.id,
        relatedCase: o.targetCase,
        similarityScore: o.similarityScore,
        textSimilarity: o.textSimilarity,
        institutionMatch: o.institutionMatch,
        categoryMatch: o.categoryMatch,
        dateProximity: o.dateProximity,
        matchedFactors: JSON.parse(o.matchedFactors || "[]"),
        reasons: o.reasons,
        confidenceLevel: o.confidenceLevel,
        status: o.status,
      })),
      ...complaint.targetOverlaps.map((o) => ({
        id: o.id,
        relatedCase: o.sourceCase,
        similarityScore: o.similarityScore,
        textSimilarity: o.textSimilarity,
        institutionMatch: o.institutionMatch,
        categoryMatch: o.categoryMatch,
        dateProximity: o.dateProximity,
        matchedFactors: JSON.parse(o.matchedFactors || "[]"),
        reasons: o.reasons,
        confidenceLevel: o.confidenceLevel,
        status: o.status,
      })),
    ];

    return NextResponse.json({
      case: complaint,
      overlaps,
    });
  } catch (err) {
    console.error("Error fetching case details:", err);
    return NextResponse.json({ error: "Failed to fetch case details" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
          { error: `Forbidden: Regional officers can only modify cases within their assigned region (${officer.region}).` },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const parsed = patchCaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const data = parsed.data;
    const previousStatus = complaint.status;
    const newStatus = data.status || previousStatus;

    // Check if status changed
    const statusChanged = data.status && data.status !== previousStatus;

    // Assignment permission check: Only Admin and Bureau Officers can assign/reassign cases to other officers
    if (data.assignedOfficerId !== undefined && officer.role === "REGIONAL_OFFICER") {
      // Regional officer can only assign to themselves if unassigned
      if (data.assignedOfficerId && data.assignedOfficerId !== officer.id) {
        return NextResponse.json(
          { error: "Regional officers can only assign cases to themselves." },
          { status: 403 }
        );
      }
    }

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.priority) updateData.priority = data.priority;
    if (data.department) updateData.department = data.department;
    if (data.assignedOfficerId !== undefined) updateData.assignedOfficerId = data.assignedOfficerId;
    if (data.resolutionNotes !== undefined) updateData.resolutionNotes = data.resolutionNotes;

    const updatedCase = await prisma.complaint.update({
      where: { id: complaint.id },
      data: updateData,
      include: {
        assignedOfficer: { select: { id: true, name: true, email: true } },
        institution: true,
      },
    });

    // Record status history if status changed
    if (statusChanged) {
      await prisma.caseStatusHistory.create({
        data: {
          caseId: complaint.id,
          changedById: officer.id,
          previousStatus,
          newStatus: data.status!,
          reason: data.reason || `Status updated from ${previousStatus} to ${data.status} by ${officer.name}`,
        },
      });
    }

    // Log audit event
    await logAuditEvent({
      userId: officer.id,
      userEmail: officer.email,
      userRole: officer.role,
      action: statusChanged ? "CASE_STATUS_UPDATED" : "CASE_UPDATED",
      entityType: "Complaint",
      entityId: complaint.id,
      details: {
        caseId: complaint.caseId,
        previousStatus,
        newStatus: data.status,
        priority: data.priority,
        assignedOfficerId: data.assignedOfficerId,
        reason: data.reason,
      },
    });

    return NextResponse.json({
      success: true,
      case: updatedCase,
    });
  } catch (err) {
    console.error("Error updating case:", err);
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
  }
}

