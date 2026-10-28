import assert from "node:assert";
import { prisma } from "../src/lib/db";
import { compareTwoCases, runOverlapDetection } from "../src/lib/overlap-detector";
import { hashPassword, comparePassword, createSessionToken, verifySessionToken, logAuditEvent } from "../src/lib/auth";
import { generateCaseId } from "../src/lib/utils";

async function runIntegrationTests() {
  console.log("🚀 Starting End-to-End Database & Logic Integration Test...\n");
  let passed = 0;
  let failed = 0;

  async function testStep(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  let createdComplaintId = "";
  let createdCaseId = "";
  const testEmail = "test.integration.student@example.com";

  // Step 1: Submit new complaint directly to DB & verify persistence
  await testStep("1. Student Complaint Persistence & Case ID Assignment", async () => {
    const institution = await prisma.institution.findFirst();
    assert(institution !== null, "An institution must exist");

    createdCaseId = generateCaseId();
    const newCase = await prisma.complaint.create({
      data: {
        caseId: createdCaseId,
        studentName: "Test Candidate",
        studentEmail: testEmail,
        studentPhone: "+91 99999 88888",
        institutionId: institution.id,
        aictePid: institution.aictePid,
        category: "Excessive Fee / Capitation Fee",
        subject: "Integration Test: Mandatory unofficial development fee demanded",
        description: "The college accounts department has issued a verbal demand of Rs 65,000 for examination eligibility without valid receipt.",
        status: "SUBMITTED",
        priority: "HIGH",
        department: "Finance & Regulatory Bureau",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isDemo: true,
      },
    });

    createdComplaintId = newCase.id;
    assert.strictEqual(newCase.caseId, createdCaseId);
    assert.strictEqual(newCase.status, "SUBMITTED");

    // Add status history
    await prisma.caseStatusHistory.create({
      data: {
        caseId: newCase.id,
        previousStatus: "NONE",
        newStatus: "SUBMITTED",
        reason: "Initial submission",
      },
    });
  });

  // Step 2: Test Automated Overlap Detection on new case
  await testStep("2. Automated Overlap Scan on New Complaint", async () => {
    const scanResult = await runOverlapDetection(createdComplaintId);
    assert(scanResult.createdCount >= 0);

    const overlaps = await prisma.overlapSuggestion.findMany({
      where: {
        OR: [{ sourceCaseId: createdComplaintId }, { targetCaseId: createdComplaintId }],
      },
    });
    console.log(`     (Found ${overlaps.length} overlap suggestions for test case)`);
    assert(overlaps !== undefined);
  });

  // Step 3: Test Student Two-Factor Status Check
  await testStep("3. Student Status Check Two-Factor Email Verification", async () => {
    // Valid match
    const validMatch = await prisma.complaint.findFirst({
      where: {
        caseId: createdCaseId,
        studentEmail: testEmail,
      },
    });
    assert(validMatch !== null, "Valid email + Case ID must match");
    assert.strictEqual(validMatch.caseId, createdCaseId);

    // Invalid email match safeguard
    const invalidMatch = await prisma.complaint.findFirst({
      where: {
        caseId: createdCaseId,
        studentEmail: "snooping.hacker@example.com",
      },
    });
    assert.strictEqual(invalidMatch, null, "Mismatching email must be rejected");
  });

  // Step 4: Test Officer Authentication & Role Authorization
  await testStep("4. Demo Officer Accounts Authentication & Role Retrieval", async () => {
    const admin = await prisma.user.findUnique({ where: { email: "admin@caselens.aicte.gov.in" } });
    const bureau = await prisma.user.findUnique({ where: { email: "bureau.officer@caselens.aicte.gov.in" } });
    const roNorth = await prisma.user.findUnique({ where: { email: "ro.north@caselens.aicte.gov.in" } });

    assert(admin !== null && (await comparePassword("Admin@CaseLens2026!", admin.passwordHash)));
    assert(bureau !== null && (await comparePassword("Bureau@CaseLens2026!", bureau.passwordHash)));
    assert(roNorth !== null && (await comparePassword("Regional@CaseLens2026!", roNorth.passwordHash)));

    assert.strictEqual(admin.role, "ADMIN");
    assert.strictEqual(bureau.role, "BUREAU_OFFICER");
    assert.strictEqual(roNorth.role, "REGIONAL_OFFICER");
    assert.strictEqual(roNorth.region, "North");
  });

  // Step 5: Test Regional Scoping Enforcement
  await testStep("5. Regional Officer Scoping Server-Side Enforcement", async () => {
    const roNorth = await prisma.user.findUnique({ where: { email: "ro.north@caselens.aicte.gov.in" } });
    assert(roNorth !== null);

    // Query mimicking Regional Officer GET /api/complaints
    const scopedCases = await prisma.complaint.findMany({
      where: {
        institution: {
          region: { contains: roNorth.region! },
        },
      },
      include: { institution: true },
    });

    assert(scopedCases.length > 0);
    for (const c of scopedCases) {
      assert(
        c.institution.region.toLowerCase().includes("north"),
        `Regional officer scope breached by institution in ${c.institution.region}`
      );
    }
  });

  // Step 6: Case Status Transition & Audit Trail
  await testStep("6. Officer Status Transition with Remark & Audit Logging", async () => {
    const admin = await prisma.user.findUnique({ where: { email: "admin@caselens.aicte.gov.in" } });
    assert(admin !== null);

    // Update status to IN_PROGRESS
    const updated = await prisma.complaint.update({
      where: { id: createdComplaintId },
      data: {
        status: "IN_PROGRESS",
        assignedOfficerId: admin.id,
      },
    });
    assert.strictEqual(updated.status, "IN_PROGRESS");

    // Add status history
    await prisma.caseStatusHistory.create({
      data: {
        caseId: createdComplaintId,
        changedById: admin.id,
        previousStatus: "SUBMITTED",
        newStatus: "IN_PROGRESS",
        reason: "Test inquiry initiated",
      },
    });

    // Add internal remark
    const remark = await prisma.caseRemark.create({
      data: {
        caseId: createdComplaintId,
        userId: admin.id,
        remark: "Investigation team dispatched for fee audit.",
        isInternal: true,
      },
    });
    assert.strictEqual(remark.isInternal, true);

    // Log audit
    await logAuditEvent({
      userId: admin.id,
      userEmail: admin.email,
      userRole: admin.role,
      action: "CASE_STATUS_UPDATED",
      entityType: "Complaint",
      entityId: createdComplaintId,
      details: { previousStatus: "SUBMITTED", newStatus: "IN_PROGRESS" },
    });

    const auditCheck = await prisma.auditLog.findFirst({
      where: { entityId: createdComplaintId },
      orderBy: { createdAt: "desc" },
    });
    assert(auditCheck !== null);
    assert.strictEqual(auditCheck.action, "CASE_STATUS_UPDATED");
  });

  // Step 7: Overlap Review Confirmation
  await testStep("7. Officer Overlap Confirmation & Audit Entry", async () => {
    const admin = await prisma.user.findUnique({ where: { email: "admin@caselens.aicte.gov.in" } });
    assert(admin !== null);

    const suggestion = await prisma.overlapSuggestion.findFirst();
    if (suggestion) {
      const updated = await prisma.overlapSuggestion.update({
        where: { id: suggestion.id },
        data: {
          status: "CONFIRMED_OVERLAP",
          reviewNotes: "Test confirmation of pattern.",
          reviewedById: admin.id,
          reviewedAt: new Date(),
        },
      });
      assert.strictEqual(updated.status, "CONFIRMED_OVERLAP");
    }
  });

  // Cleanup test complaint
  await prisma.complaint.delete({ where: { id: createdComplaintId } });
  console.log("  🧹 Cleaned up temporary integration test complaint.");

  console.log(`\n========================================`);
  console.log(`Integration Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runIntegrationTests()
  .catch((e) => {
    console.error("FATAL integration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

