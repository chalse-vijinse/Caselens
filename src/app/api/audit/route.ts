import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOfficerFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const officer = await getOfficerFromRequest(req);
    if (!officer) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Admin only access to full system audit trails
    if (officer.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Admin officers have clearance to inspect audit logs." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "";
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));

    const whereClause: any = {};
    if (action) {
      whereClause.action = action;
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ auditLogs });
  } catch (err) {
    console.error("Audit log fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch audit records" }, { status: 500 });
  }
}

