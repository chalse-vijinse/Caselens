import { NextRequest, NextResponse } from "next/server";
import { getOfficerFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const officer = await getOfficerFromRequest(req);
  if (!officer) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: officer,
  });
}

