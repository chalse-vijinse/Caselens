import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "caselens-aicte-hackathon-2026-super-secure-token-key-32chars"
);

export const COOKIE_NAME = "caselens_auth_token";

export interface OfficerSessionPayload {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "BUREAU_OFFICER" | "REGIONAL_OFFICER";
  department?: string | null;
  region?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: OfficerSessionPayload): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<OfficerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as OfficerSessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionOfficer(): Promise<OfficerSessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getOfficerFromRequest(req: NextRequest): Promise<OfficerSessionPayload | null> {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value || req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function logAuditEvent({
  userId,
  userEmail,
  userRole,
  action,
  entityType,
  entityId,
  details,
  ipAddress = "127.0.0.1",
}: {
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details: Record<string, unknown> | string;
  ipAddress?: string | null;
}) {
  try {
    const detailString = typeof details === "string" ? details : JSON.stringify(details);
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || "System/Public",
        userRole: userRole || "ANONYMOUS",
        action,
        entityType,
        entityId: entityId || null,
        details: detailString,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

// In-memory rate-limiter for demo/hackathon protection against spam
const rateLimitMap = new Map<string, { count: number; firstSeen: number }>();
export function checkRateLimit(key: string, limit = 10, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.firstSeen > windowMs) {
    rateLimitMap.set(key, { count: 1, firstSeen: now });
    return { allowed: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

