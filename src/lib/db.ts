import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const tmpDbPath = path.join("/tmp", "dev.db");

// Support writable SQLite in Vercel Serverless environment
if (process.env.VERCEL) {
  const candidatePaths = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "dev.db"),
    path.join(__dirname, "..", "..", "..", "prisma", "dev.db"),
    path.join(__dirname, "..", "..", "prisma", "dev.db"),
    path.join(__dirname, "prisma", "dev.db"),
  ];

  if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
    let copied = false;
    for (const p of candidatePaths) {
      if (fs.existsSync(p) && fs.statSync(p).size > 0) {
        try {
          fs.copyFileSync(p, tmpDbPath);
          console.log(`Successfully initialized /tmp/dev.db from ${p}`);
          copied = true;
          break;
        } catch (e) {
          console.error("Failed to copy SQLite db to /tmp:", e);
        }
      }
    }
  }

  process.env.DATABASE_URL = `file:${tmpDbPath}`;
}

const dbUrl = process.env.VERCEL
  ? `file:${tmpDbPath}`
  : process.env.DATABASE_URL || "file:./dev.db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Fallback auto-seeder to ensure demo officer accounts exist
 * even if the database is newly created in /tmp on Vercel.
 */
export async function ensureDemoUsersExist() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("No officer accounts found. Auto-seeding demo accounts...");
      const adminPasswordHash = await bcrypt.hash("Admin@CaseLens2026!", 10);
      const bureauPasswordHash = await bcrypt.hash("Bureau@CaseLens2026!", 10);
      const regionalPasswordHash = await bcrypt.hash("Regional@CaseLens2026!", 10);

      await prisma.user.createMany({
        data: [
          {
            email: "admin@caselens.aicte.gov.in",
            name: "Dr. Alok Verma (Director General)",
            passwordHash: adminPasswordHash,
            role: "ADMIN",
            department: "Institutional Vigilance & Governance",
            region: "HQ",
            isActive: true,
          },
          {
            email: "bureau.officer@caselens.aicte.gov.in",
            name: "Smt. Sunita Rao (Chief Vigilance Officer)",
            passwordHash: bureauPasswordHash,
            role: "BUREAU_OFFICER",
            department: "Approval Bureau",
            region: "HQ",
            isActive: true,
          },
          {
            email: "ro.north@caselens.aicte.gov.in",
            name: "Shri Rajesh Sharma (Regional Officer)",
            passwordHash: regionalPasswordHash,
            role: "REGIONAL_OFFICER",
            department: "North Regional Office",
            region: "North",
            isActive: true,
          },
          {
            email: "ro.south@caselens.aicte.gov.in",
            name: "Dr. K. S. Ramanathan (Regional Officer)",
            passwordHash: regionalPasswordHash,
            role: "REGIONAL_OFFICER",
            department: "South Regional Office",
            region: "South",
            isActive: true,
          },
        ],
      });
      console.log("Demo officer accounts auto-seeded successfully.");
    }
  } catch (err) {
    console.warn("Auto-seed check encountered non-fatal error:", err);
  }
}
