import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOfficerFromRequest, hashPassword, logAuditEvent } from "@/lib/auth";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "BUREAU_OFFICER", "REGIONAL_OFFICER"]),
  department: z.string().optional(),
  region: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const officer = await getOfficerFromRequest(req);
    if (!officer) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // List of officers is accessible for assignment selectors, but full details restricted
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        region: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const officer = await getOfficerFromRequest(req);
    if (!officer || officer.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Admin users can create officer accounts." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const { name, email, password, role, department, region } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        department: department?.trim() || null,
        region: region?.trim() || null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        region: true,
        isActive: true,
      },
    });

    await logAuditEvent({
      userId: officer.id,
      userEmail: officer.email,
      userRole: officer.role,
      action: "USER_CREATED",
      entityType: "User",
      entityId: user.id,
      details: { email: user.email, role: user.role, region: user.region },
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

