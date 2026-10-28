import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, getOfficerFromRequest, logAuditEvent } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const officer = await getOfficerFromRequest(req);
    if (officer) {
      await logAuditEvent({
        userId: officer.id,
        userEmail: officer.email,
        userRole: officer.role,
        action: "OFFICER_LOGOUT",
        entityType: "Auth",
        entityId: officer.id,
        details: "Officer logged out session.",
      });
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.delete(COOKIE_NAME);
    return response;
  } catch (err) {
    console.error("Logout error:", err);
    const response = NextResponse.json({ success: true });
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

