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

    const whereClause: any = {};
    if (officer.role === "REGIONAL_OFFICER" && officer.region) {
      whereClause.institution = {
        region: { contains: officer.region },
      };
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        institution: { select: { name: true, region: true } },
      },
    });

    const totalCases = complaints.length;
    const submittedCount = complaints.filter((c) => c.status === "SUBMITTED").length;
    const underReviewCount = complaints.filter((c) => c.status === "UNDER_REVIEW").length;
    const assignedCount = complaints.filter((c) => c.status === "ASSIGNED").length;
    const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
    const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;
    const closedCount = complaints.filter((c) => c.status === "CLOSED").length;

    // Check overdue: dueDate is in the past and status is not RESOLVED or CLOSED
    const now = new Date();
    const overdueCount = complaints.filter(
      (c) => c.dueDate && new Date(c.dueDate) < now && c.status !== "RESOLVED" && c.status !== "CLOSED"
    ).length;

    // By Status breakdown
    const byStatus = [
      { name: "Submitted", count: submittedCount, color: "#3b82f6" },
      { name: "Under Review", count: underReviewCount, color: "#f59e0b" },
      { name: "Assigned", count: assignedCount, color: "#a855f7" },
      { name: "In Progress", count: inProgressCount, color: "#6366f1" },
      { name: "Resolved", count: resolvedCount, color: "#10b981" },
      { name: "Closed", count: closedCount, color: "#64748b" },
    ];

    // By Category breakdown
    const categoryMap = new Map<string, number>();
    complaints.forEach((c) => {
      categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + 1);
    });
    const byCategory = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By Department breakdown
    const deptMap = new Map<string, number>();
    complaints.forEach((c) => {
      const dept = c.department || "Unassigned Bureau";
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });
    const byDepartment = Array.from(deptMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By Institution breakdown (Top 5)
    const instMap = new Map<string, number>();
    complaints.forEach((c) => {
      const instName = c.institution?.name || "Unknown";
      instMap.set(instName, (instMap.get(instName) || 0) + 1);
    });
    const byInstitution = Array.from(instMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Monthly Trend (group by YYYY-MM)
    const monthlyMap = new Map<string, number>();
    complaints.forEach((c) => {
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    });

    const monthlyTrend = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        const [year, m] = month.split("-");
        const dateObj = new Date(parseInt(year), parseInt(m) - 1, 1);
        const label = dateObj.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        return { month: label, cases: count };
      });

    // Resolution Duration Analysis (in days for resolved/closed cases)
    const resolvedCases = complaints.filter(
      (c) => (c.status === "RESOLVED" || c.status === "CLOSED") && c.updatedAt
    );
    let avgResolutionDays = 0;
    if (resolvedCases.length > 0) {
      const totalDays = resolvedCases.reduce((acc, c) => {
        const duration = (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 3600 * 24);
        return acc + Math.max(1, Math.round(duration));
      }, 0);
      avgResolutionDays = Number((totalDays / resolvedCases.length).toFixed(1));
    }

    // Overlap count
    const overlapCount = await prisma.overlapSuggestion.count({
      where:
        officer.role === "REGIONAL_OFFICER" && officer.region
          ? {
              OR: [
                { sourceCase: { institution: { region: { contains: officer.region } } } },
                { targetCase: { institution: { region: { contains: officer.region } } } },
              ],
            }
          : {},
    });

    return NextResponse.json({
      summary: {
        totalCases,
        submittedCount,
        inProgressCount: inProgressCount + underReviewCount + assignedCount,
        resolvedCount: resolvedCount + closedCount,
        overdueCount,
        overlapCount,
        avgResolutionDays,
        resolutionRate: totalCases > 0 ? Number(((resolvedCount + closedCount) / totalCases * 100).toFixed(1)) : 0,
      },
      byStatus,
      byCategory,
      byDepartment,
      byInstitution,
      monthlyTrend,
    });
  } catch (err) {
    console.error("Error generating reports:", err);
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 });
  }
}

