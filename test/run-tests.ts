import assert from "node:assert";
import { generateCaseId } from "../src/lib/utils";
import {
  tokenize,
  getNgrams,
  jaccardSimilarity,
  computeTf,
  cosineSimilarity,
  compareTwoCases,
} from "../src/lib/overlap-detector";
import { hashPassword, comparePassword, createSessionToken, verifySessionToken, checkRateLimit } from "../src/lib/auth";
import { prisma } from "../src/lib/db";

async function runTests() {
  console.log("🧪 Starting CaseLens Automated Test Suite...\n");
  let passed = 0;
  let failed = 0;

  function runTest(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
        failed++;
      });
  }

  // 1. Case ID Generator Test
  await runTest("Case ID generation format matches AICTE-[YEAR]-[A-Z0-9]+", () => {
    const id = generateCaseId();
    assert.match(id, /^AICTE-\d{4}-[A-Z0-9]+$/);
  });

  // 2. Tokenize & Stopwords Filter
  await runTest("Overlap Detector tokenization excludes English stopwords", () => {
    const text = "Please kindly note that the college is charging excessive illegal fee for each student";
    const tokens = tokenize(text);
    assert(!tokens.includes("please"));
    assert(!tokens.includes("the"));
    assert(!tokens.includes("that"));
    assert(!tokens.includes("is"));
    assert(tokens.includes("charging"));
    assert(tokens.includes("excessive"));
    assert(tokens.includes("illegal"));
    assert(tokens.includes("fee"));
  });

  // 3. Jaccard & N-gram Similarity
  await runTest("N-gram Jaccard similarity detects identical phrase overlap", () => {
    const tokensA = ["excessive", "capitation", "fee", "demanded", "cash"];
    const tokensB = ["excessive", "capitation", "fee", "without", "receipt"];
    const ngramsA = new Set(getNgrams(tokensA, 2));
    const ngramsB = new Set(getNgrams(tokensB, 2));
    const sim = jaccardSimilarity(ngramsA, ngramsB);
    assert(sim > 0.2, "Expected phrase overlap to be > 0.2");
  });

  // 4. TF-IDF Cosine Similarity
  await runTest("Cosine similarity accurately scores identical vs dissimilar texts", () => {
    const tokens1 = ["laboratory", "equipment", "broken", "cnc", "machines"];
    const tokens2 = ["laboratory", "equipment", "defunct", "cnc", "machines"];
    const tokens3 = ["hostel", "mess", "sanitation", "water", "infection"];

    const tf1 = computeTf(tokens1);
    const tf2 = computeTf(tokens2);
    const tf3 = computeTf(tokens3);

    const highSim = cosineSimilarity(tf1, tf2);
    const lowSim = cosineSimilarity(tf1, tf3);

    assert(highSim > 0.7, `Expected high similarity > 0.7, got ${highSim}`);
    assert(lowSim < 0.2, `Expected low similarity < 0.2, got ${lowSim}`);
  });

  // 5. 4-Factor Hybrid Formula Verification
  await runTest("Hybrid Overlap formula correctly computes 40/30/20/10 weighted score", () => {
    const caseA = {
      caseId: "AICTE-TEST-001",
      subject: "Demanding 65000 special development fee without receipt",
      description: "College management demands sixty five thousand rupees development fee before exams",
      category: "Excessive Fee / Capitation Fee",
      institutionId: "inst_123",
      institutionName: "Apex Institute of Engineering",
      createdAt: new Date("2026-10-15T10:00:00Z"),
    };

    const caseB = {
      caseId: "AICTE-TEST-002",
      subject: "Illegal demand for sixty five thousand fee without receipt",
      description: "Authorities demanding 65000 extra lab development fee and withholding admit card",
      category: "Excessive Fee / Capitation Fee",
      institutionId: "inst_123",
      institutionName: "Apex Institute of Engineering",
      createdAt: new Date("2026-10-18T10:00:00Z"),
    };

    const result = compareTwoCases(caseA, caseB);
    assert.strictEqual(result.institutionMatch, 100, "Institution match should be 100%");
    assert.strictEqual(result.categoryMatch, 100, "Category match should be 100%");
    assert.strictEqual(result.dateProximity, 100, "Submitted 3 days apart should be 100%");
    assert(result.similarityScore >= 70, `Expected High Confidence match >= 70, got ${result.similarityScore}`);
    assert.strictEqual(result.confidenceLevel, "HIGH_CONFIDENCE");
  });

  // 6. Password Hashing & Verification
  await runTest("Password hashing with bcryptjs generates valid salt and validates", async () => {
    const raw = "Admin@CaseLens2026!";
    const hash = await hashPassword(raw);
    assert.notStrictEqual(raw, hash);
    const isValid = await comparePassword(raw, hash);
    assert.strictEqual(isValid, true);
    const isInvalid = await comparePassword("WrongPassword123!", hash);
    assert.strictEqual(isInvalid, false);
  });

  // 7. JWT Session Creation & Verification
  await runTest("JWT session tokens sign and verify user role payload", async () => {
    const payload = {
      id: "user_test_1",
      email: "ro.north@caselens.aicte.gov.in",
      name: "Rajesh Sharma",
      role: "REGIONAL_OFFICER" as const,
      region: "North",
    };
    const token = await createSessionToken(payload);
    assert(typeof token === "string" && token.length > 20);

    const verified = await verifySessionToken(token);
    assert(verified !== null);
    assert.strictEqual(verified.email, payload.email);
    assert.strictEqual(verified.role, "REGIONAL_OFFICER");
    assert.strictEqual(verified.region, "North");
  });

  // 8. Rate Limiting Protection
  await runTest("Rate limiter enforces request limit in sliding window", () => {
    const key = `test_ip_${Date.now()}`;
    const first = checkRateLimit(key, 3, 10000);
    assert.strictEqual(first.allowed, true);
    checkRateLimit(key, 3, 10000);
    checkRateLimit(key, 3, 10000);
    const blocked = checkRateLimit(key, 3, 10000);
    assert.strictEqual(blocked.allowed, false);
  });

  // 9. Database Persistence & Query Integrity
  await runTest("SQLite persistent database holds institutions, users, and cases", async () => {
    const [instCount, userCount, complaintCount, overlapCount] = await Promise.all([
      prisma.institution.count(),
      prisma.user.count(),
      prisma.complaint.count(),
      prisma.overlapSuggestion.count(),
    ]);

    assert(instCount >= 10, `Expected at least 10 institutions, got ${instCount}`);
    assert(userCount >= 4, `Expected at least 4 demo officer accounts, got ${userCount}`);
    assert(complaintCount >= 30, `Expected at least 30 complaints, got ${complaintCount}`);
    assert(overlapCount > 0, `Expected overlap suggestions to exist, got ${overlapCount}`);
  });

  // 10. Regional Officer Query Scoping Integrity
  await runTest("Regional Officer query scoping restricts cases strictly to officer region", async () => {
    const officerRegion = "North";
    const northCases = await prisma.complaint.findMany({
      where: {
        institution: {
          region: { contains: officerRegion },
        },
      },
      include: { institution: true },
    });

    assert(northCases.length > 0, "North region should have cases");
    for (const c of northCases) {
      assert(
        c.institution.region.toLowerCase().includes(officerRegion.toLowerCase()),
        `Case ${c.caseId} from ${c.institution.region} leaked into North regional scope`
      );
    }
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error("FATAL test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

