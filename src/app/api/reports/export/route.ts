import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOfficerFromRequest, logAuditEvent } from "@/lib/auth";

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/\r\n/g, " ").replace(/\n/g, " ");
  // Defend against CSV injection (formula injection)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  try {
    const officer = await getOfficerFromRequest(req);
    if (!officer) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const whereClause: any = {};
    if (officer.role === "REGIONAL_OFFICER" && officer.region) {
      whereClause.institution = {
        region: { contains: officer.region },
      };
    }

    const cases = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        institution: { select: { name: true, aictePid: true, region: true, state: true } },
        assignedOfficer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Case ID",
      "Submission Date",
      "Student Name",
      "Student Email",
      "Institution Name",
      "AICTE PID",
      "Region",
      "Category",
      "Subject",
      "Status",
      "Priority",
      "Assigned Department",
      "Assigned Officer",
      "Resolution Remarks",
      "Last Updated",
    ];

    const rows = cases.map((c) => [
      c.caseId,
      c.createdAt.toISOString().split("T")[0],
      c.studentName,
      c.studentEmail,
      c.institution?.name || "N/A",
      c.institution?.aictePid || "N/A",
      c.institution?.region || "N/A",
      c.category,
      c.subject,
      c.status,
      c.priority,
      c.department || "Unassigned",
      c.assignedOfficer?.name || "Unassigned",
      c.resolutionNotes || "",
      c.updatedAt.toISOString().split("T")[0],
    ]);

    const csvContent = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map((row) => row.map(escapeCsvCell).join(",")),
    ].join("\r\n");

    await logAuditEvent({
      userId: officer.id,
      userEmail: officer.email,
      userRole: officer.role,
      action: "REPORTS_CSV_EXPORTED",
      entityType: "Report",
      details: { exportedRecords: cases.length },
    });

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CaseLens_AICTE_Complaints_Report_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error("CSV Export error:", err);
    return NextResponse.json({ error: "Failed to export report" }, { status: 500 });
  }
}

