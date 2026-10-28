import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOfficerFromRequest, logAuditEvent, checkRateLimit } from "@/lib/auth";
import { generateCaseId } from "@/lib/utils";
import { runOverlapDetection } from "@/lib/overlap-detector";

export const dynamic = "force-dynamic";

const submitComplaintSchema = z.object({
  studentName: z.string().min(2, "Student name must be at least 2 characters").max(100),
  studentEmail: z.string().email("Please enter a valid student email address"),
  studentPhone: z.string().max(20).optional().nullable(),
  institutionId: z.string().min(1, "Please select an institution"),
  aictePid: z.string().max(50).optional().nullable(),
  category: z.string().min(2, "Please select a complaint category"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  description: z.string().min(20, "Detailed description must be at least 20 characters").max(5000),
  referenceNumber: z.string().max(50).optional().nullable(),
});

// PUBLIC: Student Complaint Submission
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rate = checkRateLimit(`submit_${ip}`, 10, 60000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Submission rate limit exceeded. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = submitComplaintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: data.institutionId },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Selected institution was not found in the AICTE directory." },
        { status: 404 }
      );
    }

    // Check for obvious exact duplicate submitted in the last 15 minutes by same email & institution
    const recentDuplicate = await prisma.complaint.findFirst({
      where: {
        studentEmail: data.studentEmail.toLowerCase().trim(),
        institutionId: data.institutionId,
        subject: data.subject.trim(),
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
    });

    if (recentDuplicate) {
      return NextResponse.json(
        {
          error: "A complaint with identical subject was recently registered from this email address.",
          existingCaseId: recentDuplicate.caseId,
        },
        { status: 409 }
      );
    }

    // Generate unique Case ID
    let caseId = generateCaseId();
    let collisionCheck = await prisma.complaint.findUnique({ where: { caseId } });
    while (collisionCheck) {
      caseId = generateCaseId();
      collisionCheck = await prisma.complaint.findUnique({ where: { caseId } });
    }

    // Map default department based on category
    let department = "Student Welfare & Grievance Cell";
    if (data.category.includes("Fee") || data.category.includes("Refund") || data.category.includes("Financial")) {
      department = "Finance & Regulatory Bureau";
    } else if (data.category.includes("Infrastructure") || data.category.includes("Unapproved")) {
      department = "Approval Bureau";
    } else if (data.category.includes("Curriculum") || data.category.includes("Faculty")) {
      department = "Policy & Academic Planning Bureau";
    }

    const newCase = await prisma.complaint.create({
      data: {
        caseId,
        studentName: data.studentName.trim(),
        studentEmail: data.studentEmail.toLowerCase().trim(),
        studentPhone: data.studentPhone?.trim() || null,
        institutionId: institution.id,
        aictePid: institution.aictePid,
        category: data.category,
        subject: data.subject.trim(),
        description: data.description.trim(),
        referenceNumber: data.referenceNumber?.trim() || null,
        status: "SUBMITTED",
        priority: "MEDIUM",
        department,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day SLA
        isDemo: false,
      },
    });

    // Create initial status history entry
    await prisma.caseStatusHistory.create({
      data: {
        caseId: newCase.id,
        previousStatus: "NONE",
        newStatus: "SUBMITTED",
        reason: "Initial student submission via Public Portal",
      },
    });

    // Write audit event
    await logAuditEvent({
      userId: null,
      userEmail: data.studentEmail,
      userRole: "STUDENT",
      action: "CASE_SUBMITTED",
      entityType: "Complaint",
      entityId: newCase.id,
      details: {
        caseId: newCase.caseId,
        institution: institution.name,
        category: newCase.category,
      },
      ipAddress: ip,
    });

    // Trigger automated overlap detection against existing complaints
    try {
      await runOverlapDetection(newCase.id);
    } catch (overlapErr) {
      console.error("Non-fatal error running overlap detection on new complaint:", overlapErr);
    }

    return NextResponse.json({
      success: true,
      caseId: newCase.caseId,
      createdAt: newCase.createdAt,
      status: newCase.status,
      institutionName: institution.name,
      category: newCase.category,
    });
  } catch (err) {
    console.error("Complaint submission error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your complaint." },
      { status: 500 }
    );
  }
}

// PRIVATE: Officer Complaint List & Search with Role-Based Scoping
export async function GET(req: NextRequest) {
  try {
    const officer = await getOfficerFromRequest(req);
    if (!officer) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const priority = searchParams.get("priority") || "";
    const department = searchParams.get("department") || "";
    const institutionId = searchParams.get("institutionId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    // Build Prisma where filter
    const whereClause: any = {};

    // ROLE-BASED ACCESS CONTROL ENFORCEMENT:
    // Regional Officer can ONLY view cases where institution region matches their assigned region!
    if (officer.role === "REGIONAL_OFFICER" && officer.region) {
      whereClause.institution = {
        region: {
          contains: officer.region,
        },
      };
    }

    if (search.trim()) {
      whereClause.OR = [
        { caseId: { contains: search.trim() } },
        { subject: { contains: search.trim() } },
        { studentName: { contains: search.trim() } },
        { studentEmail: { contains: search.trim() } },
        { institution: { name: { contains: search.trim() } } },
      ];
    }

    if (status && status !== "ALL") {
      whereClause.status = status;
    }
    if (category && category !== "ALL") {
      whereClause.category = category;
    }
    if (priority && priority !== "ALL") {
      whereClause.priority = priority;
    }
    if (department && department !== "ALL") {
      whereClause.department = department;
    }
    if (institutionId && institutionId !== "ALL") {
      whereClause.institutionId = institutionId;
    }

    const [totalCount, cases] = await Promise.all([
      prisma.complaint.count({ where: whereClause }),
      prisma.complaint.findMany({
        where: whereClause,
        include: {
          institution: {
            select: { id: true, name: true, region: true, state: true, aictePid: true },
          },
          assignedOfficer: {
            select: { id: true, name: true, email: true, role: true },
          },
          _count: {
            select: { remarks: true, sourceOverlaps: true, targetOverlaps: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      officerScope: {
        role: officer.role,
        region: officer.region,
      },
    });
  } catch (err) {
    console.error("Error fetching cases:", err);
    return NextResponse.json({ error: "Failed to fetch complaint cases" }, { status: 500 });
  }
}

