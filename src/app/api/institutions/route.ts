import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const region = searchParams.get("region") || "";

    const whereClause: any = {};
    if (search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim() } },
        { aictePid: { contains: search.trim() } },
        { city: { contains: search.trim() } },
        { state: { contains: search.trim() } },
      ];
    }
    if (region && region !== "ALL") {
      whereClause.region = { contains: region };
    }

    const institutions = await prisma.institution.findMany({
      where: whereClause,
      include: {
        complaints: {
          select: { id: true, status: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = institutions.map((inst) => {
      const totalCases = inst.complaints.length;
      const openCases = inst.complaints.filter(
        (c) => c.status !== "RESOLVED" && c.status !== "CLOSED"
      ).length;
      const resolvedCases = inst.complaints.filter(
        (c) => c.status === "RESOLVED" || c.status === "CLOSED"
      ).length;

      return {
        id: inst.id,
        name: inst.name,
        aictePid: inst.aictePid,
        region: inst.region,
        state: inst.state,
        city: inst.city,
        institutionType: inst.institutionType,
        isDemo: inst.isDemo,
        totalCases,
        openCases,
        resolvedCases,
      };
    });

    return NextResponse.json({ institutions: formatted });
  } catch (err) {
    console.error("Error fetching institutions:", err);
    return NextResponse.json({ error: "Failed to fetch institutions" }, { status: 500 });
  }
}

