import { NextRequest, NextResponse } from "next/server";
import { getOfficerFromRequest, logAuditEvent } from "@/lib/auth";
import { runOverlapDetection } from "@/lib/overlap-detector";

export async function POST(req: NextRequest) {
  try {
    const officer = await getOfficerFromRequest(req);
    if (!officer) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const result = await runOverlapDetection();

    await logAuditEvent({
      userId: officer.id,
      userEmail: officer.email,
      userRole: officer.role,
      action: "OVERLAP_SCAN_TRIGGERED",
      entityType: "OverlapSuggestion",
      details: { generatedSuggestions: result.createdCount },
    });

    return NextResponse.json({
      success: true,
      message: `Overlap detection scan complete. Processed and saved ${result.createdCount} potential matches.`,
      createdCount: result.createdCount,
    });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Failed to run overlap scan" }, { status: 500 });
  }
}

