import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { comparePassword, createSessionToken, COOKIE_NAME, logAuditEvent, checkRateLimit } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rate = checkRateLimit(`login_${ip}`, 15, 60000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 1 minute before retrying." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid credentials or account is inactive." },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials or account is inactive." },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "ADMIN" | "BUREAU_OFFICER" | "REGIONAL_OFFICER",
      department: user.department,
      region: user.region,
    };

    const token = await createSessionToken(sessionPayload);

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: "OFFICER_LOGIN",
      entityType: "Auth",
      entityId: user.id,
      details: { role: user.role, region: user.region, department: user.department },
      ipAddress: ip,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        region: user.region,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing login." },
      { status: 500 }
    );
  }
}

