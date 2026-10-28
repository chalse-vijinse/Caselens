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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const confidence = searchParams.get("confidence") || "ALL";
    const minScore = parseFloat(searchParams.get("minScore") || "0");

    const whereClause: any = {};
    if (status !== "ALL") {
      whereClause.status = status;
    }
    if (confidence !== "ALL") {
      whereClause.confidenceLevel = confidence;
    }
    if (minScore > 0) {
      whereClause.similarityScore = { gte: minScore };
    }

    // Role-based regional scoping:
    // If regional officer, only show overlap suggestions where at least one of the cases is in their region!
    if (officer.role === "REGIONAL_OFFICER" && officer.region) {
      whereClause.OR = [
        { sourceCase: { institution: { region: { contains: officer.region } } } },
        { targetCase: { institution: { region: { contains: officer.region } } } },
      ];
    }

    const suggestions = await prisma.overlapSuggestion.findMany({
      where: whereClause,
      include: {
        sourceCase: {
          select: {
            id: true,
            caseId: true,
            subject: true,
            category: true,
            status: true,
            priority: true,
            studentName: true,
            createdAt: true,
            institution: { select: { name: true, region: true, aictePid: true } },
          },
        },
        targetCase: {
          select: {
            id: true,
            caseId: true,
            subject: true,
            category: true,
            status: true,
            priority: true,
            studentName: true,
            createdAt: true,
            institution: { select: { name: true, region: true, aictePid: true } },
          },
        },
        reviewedBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { similarityScore: "desc" },
    });

    const parsedSuggestions = suggestions.map((s) => ({
      ...s,
      matchedFactors: JSON.parse(s.matchedFactors || "[]"),
    }));

    // KPI stats for the overlaps page
    const totalCount = parsedSuggestions.length;
    const highConfidenceCount = parsedSuggestions.filter((s) => s.confidenceLevel === "HIGH_CONFIDENCE").length;
    const confirmedCount = parsedSuggestions.filter((s) => s.status === "CONFIRMED_OVERLAP").length;
    const pendingReviewCount = parsedSuggestions.filter((s) => s.status === "SUGGESTED").length;

    return NextResponse.json({
      suggestions: parsedSuggestions,
      stats: {
        totalCount,
        highConfidenceCount,
        confirmedCount,
        pendingReviewCount,
      },
    });
  } catch (err) {
    console.error("Error fetching overlaps:", err);
    return NextResponse.json({ error: "Failed to fetch overlap suggestions" }, { status: 500 });
  }
}

