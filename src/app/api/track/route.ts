import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/auth";

const trackSchema = z.object({
  caseId: z.string().min(5, "Please enter a valid Case ID (e.g. AICTE-2026-...)").trim(),
  studentEmail: z.string().email("Please enter the email address used during complaint submission").trim(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rate = checkRateLimit(`track_${ip}`, 12, 60000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many tracking attempts. Please wait 1 minute before retrying." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { caseId, studentEmail } = parsed.data;

    // Strict two-factor query: Must match BOTH Case ID and the registered Email!
    const complaint = await prisma.complaint.findFirst({
      where: {
        caseId: {
          equals: caseId,
        },
        studentEmail: {
          equals: studentEmail.toLowerCase(),
        },
      },
      include: {
        institution: {
          select: { name: true, region: true, state: true },
        },
        statusHistory: {
          select: {
            previousStatus: true,
            newStatus: true,
            reason: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        {
          error:
            "No active record found matching this Case ID and registered email combination. Please verify your Case ID and the exact email address provided at submission.",
        },
        { status: 404 }
      );
    }

    // Return sanitized public tracking information ONLY
    // NOTE: Internal officer remarks, internal officer names, user IDs, and overlap suggestions are STRICTLY REDACTED for student privacy and security!
    return NextResponse.json({
      success: true,
      complaint: {
        caseId: complaint.caseId,
        studentName: complaint.studentName,
        institutionName: complaint.institution.name,
        category: complaint.category,
        subject: complaint.subject,
        status: complaint.status,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        resolutionNotes: complaint.resolutionNotes || null,
        statusProgression: complaint.statusHistory.map((h) => ({
          status: h.newStatus,
          timestamp: h.createdAt,
          note: h.reason || "Status updated in AICTE Grievance System",
        })),
      },
    });
  } catch (err) {
    console.error("Track complaint error:", err);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving complaint status." },
      { status: 500 }
    );
  }
}

