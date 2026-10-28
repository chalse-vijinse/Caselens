import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const institution = await prisma.institution.findFirst({
      where: {
        OR: [{ id: params.id }, { aictePid: params.id }],
      },
      include: {
        complaints: {
          select: {
            id: true,
            caseId: true,
            subject: true,
            category: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    const totalCases = institution.complaints.length;
    const openCases = institution.complaints.filter(
      (c) => c.status !== "RESOLVED" && c.status !== "CLOSED"
    ).length;
    const resolvedCases = institution.complaints.filter(
      (c) => c.status === "RESOLVED" || c.status === "CLOSED"
    ).length;

    return NextResponse.json({
      institution: {
        ...institution,
        totalCases,
        openCases,
        resolvedCases,
      },
    });
  } catch (err) {
    console.error("Error fetching institution details:", err);
    return NextResponse.json({ error: "Failed to fetch institution details" }, { status: 500 });
  }
}

