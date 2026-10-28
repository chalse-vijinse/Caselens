import { prisma } from "./db";

// Common stop words to exclude from grievance text analysis
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "cannot", "could", "did", "do", "does", "doing", "don't", "down", "during", "each", "few",
  "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
  "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its", "itself",
  "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once",
  "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should",
  "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there",
  "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
  "wasn't", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with",
  "won't", "would", "you", "your", "yours", "yourself", "yourselves", "please", "kindly", "sir", "madam",
  "complaint", "issue", "problem", "regarding", "respecting"
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function getNgrams(tokens: string[], n = 2): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(" "));
  }
  return ngrams;
}

export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

// Compute term-frequency vector
export function computeTf(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
}

// Cosine similarity between two TF vectors
export function cosineSimilarity(tfA: Map<string, number>, tfB: Map<string, number>): number {
  const allKeys = new Set([...tfA.keys(), ...tfB.keys()]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of allKeys) {
    const valA = tfA.get(key) || 0;
    const valB = tfB.get(key) || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Fuzzy string similarity for institution names
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;

  const tokens1 = new Set(s1.split(/\s+/));
  const tokens2 = new Set(s2.split(/\s+/));
  return jaccardSimilarity(tokens1, tokens2);
}

export interface OverlapComparisonResult {
  similarityScore: number;
  textSimilarity: number;
  institutionMatch: number;
  categoryMatch: number;
  dateProximity: number;
  matchedFactors: string[];
  reasons: string;
  confidenceLevel: "HIGH_CONFIDENCE" | "POTENTIAL_MATCH" | "NEEDS_REVIEW";
}

export function compareTwoCases(
  caseA: {
    caseId: string;
    subject: string;
    description: string;
    category: string;
    institutionId: string;
    institutionName?: string;
    createdAt: Date | string;
  },
  caseB: {
    caseId: string;
    subject: string;
    description: string;
    category: string;
    institutionId: string;
    institutionName?: string;
    createdAt: Date | string;
  }
): OverlapComparisonResult {
  const matchedFactors: string[] = [];

  // 1. Text & Semantic Similarity (40% weight)
  const fullTextA = `${caseA.subject} ${caseA.description}`;
  const fullTextB = `${caseB.subject} ${caseB.description}`;

  const tokensA = tokenize(fullTextA);
  const tokensB = tokenize(fullTextB);

  const tfA = computeTf(tokensA);
  const tfB = computeTf(tokensB);
  const tfCosine = cosineSimilarity(tfA, tfB);

  // Bigram Jaccard for phrase matching
  const ngramsA = new Set(getNgrams(tokensA, 2));
  const ngramsB = new Set(getNgrams(tokensB, 2));
  const bigramJaccard = jaccardSimilarity(ngramsA, ngramsB);

  // Combined text score (0 - 100)
  const rawTextSim = Math.min(100, Math.round((tfCosine * 0.7 + bigramJaccard * 0.3) * 100));
  const textSimilarity = Math.max(0, rawTextSim);

  if (textSimilarity >= 65) {
    matchedFactors.push(`High textual similarity (${textSimilarity}% TF-IDF & phrase match)`);
  } else if (textSimilarity >= 40) {
    matchedFactors.push(`Moderate narrative correspondence (${textSimilarity}%)`);
  }

  // 2. Institution Match (30% weight)
  let institutionMatch = 0;
  if (caseA.institutionId === caseB.institutionId) {
    institutionMatch = 100;
    matchedFactors.push("Exact Institution Match (Same College/Polytechnic)");
  } else if (caseA.institutionName && caseB.institutionName) {
    const instSim = stringSimilarity(caseA.institutionName, caseB.institutionName);
    if (instSim > 0.8) {
      institutionMatch = 90;
      matchedFactors.push("High Institution Name Similarity");
    } else if (instSim > 0.5) {
      institutionMatch = 50;
      matchedFactors.push("Partial Institution Name Association");
    }
  }

  // 3. Category Match (20% weight)
  let categoryMatch = 0;
  if (caseA.category.trim().toLowerCase() === caseB.category.trim().toLowerCase()) {
    categoryMatch = 100;
    matchedFactors.push(`Same Grievance Category: "${caseA.category}"`);
  } else {
    // Check overlapping keywords in category
    const catTokensA = new Set(caseA.category.toLowerCase().split(/\s+/));
    const catTokensB = new Set(caseB.category.toLowerCase().split(/\s+/));
    const catJaccard = jaccardSimilarity(catTokensA, catTokensB);
    if (catJaccard > 0.3) {
      categoryMatch = 50;
      matchedFactors.push("Related Category Domain");
    }
  }

  // 4. Date Proximity (10% weight)
  const dateA = new Date(caseA.createdAt).getTime();
  const dateB = new Date(caseB.createdAt).getTime();
  const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);

  let dateProximity = 0;
  if (diffDays <= 7) {
    dateProximity = 100;
    matchedFactors.push(`Submitted within ${Math.ceil(diffDays)} days of each other`);
  } else if (diffDays <= 30) {
    dateProximity = 80;
    matchedFactors.push(`Submitted within same month (${Math.ceil(diffDays)} days difference)`);
  } else if (diffDays <= 90) {
    dateProximity = 50;
    matchedFactors.push(`Submitted within same academic quarter (${Math.ceil(diffDays)} days)`);
  } else {
    dateProximity = 20;
  }

  // Transparent Weighted Score:
  // 40% Text/Semantic + 30% Institution + 20% Category + 10% Date
  const weightedScore = Number(
    (
      textSimilarity * 0.4 +
      institutionMatch * 0.3 +
      categoryMatch * 0.2 +
      dateProximity * 0.1
    ).toFixed(1)
  );

  let confidenceLevel: "HIGH_CONFIDENCE" | "POTENTIAL_MATCH" | "NEEDS_REVIEW" = "NEEDS_REVIEW";
  if (weightedScore >= 70) {
    confidenceLevel = "HIGH_CONFIDENCE";
  } else if (weightedScore >= 50) {
    confidenceLevel = "POTENTIAL_MATCH";
  } else {
    confidenceLevel = "NEEDS_REVIEW";
  }

  // Generate clear reason explanation
  const reasons = [
    `Weighted Similarity Score: ${weightedScore}%.`,
    institutionMatch === 100 ? "Both complaints report against the identical institution." : "Institutions differ or have partial name match.",
    categoryMatch === 100 ? `Complaints share the exact grievance classification (${caseA.category}).` : "Grievance classifications differ.",
    `Lexical TF-IDF & N-gram cosine similarity is calculated at ${textSimilarity}%.`,
    `Grievances were logged ${Math.round(diffDays)} days apart.`,
    "Note: This is an automated advisory score. Human review is required before merging or taking joint action."
  ].join(" ");

  return {
    similarityScore: weightedScore,
    textSimilarity,
    institutionMatch,
    categoryMatch,
    dateProximity,
    matchedFactors,
    reasons,
    confidenceLevel,
  };
}

/**
 * Scan database for overlap suggestions.
 * If singleCaseId is provided, compares that case against existing cases.
 * Otherwise compares all active cases.
 */
export async function runOverlapDetection(singleCaseId?: string): Promise<{ createdCount: number }> {
  let createdCount = 0;

  if (singleCaseId) {
    const targetCase = await prisma.complaint.findUnique({
      where: { id: singleCaseId },
      include: { institution: true },
    });
    if (!targetCase) return { createdCount: 0 };

    const otherCases = await prisma.complaint.findMany({
      where: {
        id: { not: singleCaseId },
      },
      include: { institution: true },
    });

    for (const other of otherCases) {
      const res = compareTwoCases(
        {
          caseId: targetCase.caseId,
          subject: targetCase.subject,
          description: targetCase.description,
          category: targetCase.category,
          institutionId: targetCase.institutionId,
          institutionName: targetCase.institution?.name,
          createdAt: targetCase.createdAt,
        },
        {
          caseId: other.caseId,
          subject: other.subject,
          description: other.description,
          category: other.category,
          institutionId: other.institutionId,
          institutionName: other.institution?.name,
          createdAt: other.createdAt,
        }
      );

      // Only save suggestions if score is >= 35
      if (res.similarityScore >= 35) {
        // Enforce consistent ordering to prevent duplicates (source < target by ID)
        const [sourceId, targetId] = targetCase.id < other.id ? [targetCase.id, other.id] : [other.id, targetCase.id];

        await prisma.overlapSuggestion.upsert({
          where: {
            sourceCaseId_targetCaseId: {
              sourceCaseId: sourceId,
              targetCaseId: targetId,
            },
          },
          update: {
            similarityScore: res.similarityScore,
            textSimilarity: res.textSimilarity,
            institutionMatch: res.institutionMatch,
            categoryMatch: res.categoryMatch,
            dateProximity: res.dateProximity,
            matchedFactors: JSON.stringify(res.matchedFactors),
            reasons: res.reasons,
            confidenceLevel: res.confidenceLevel,
          },
          create: {
            sourceCaseId: sourceId,
            targetCaseId: targetId,
            similarityScore: res.similarityScore,
            textSimilarity: res.textSimilarity,
            institutionMatch: res.institutionMatch,
            categoryMatch: res.categoryMatch,
            dateProximity: res.dateProximity,
            matchedFactors: JSON.stringify(res.matchedFactors),
            reasons: res.reasons,
            confidenceLevel: res.confidenceLevel,
            status: "SUGGESTED",
          },
        });
        createdCount++;
      }
    }
  } else {
    // Scan all complaints pairwise
    const allCases = await prisma.complaint.findMany({
      include: { institution: true },
      orderBy: { createdAt: "desc" },
    });

    for (let i = 0; i < allCases.length; i++) {
      for (let j = i + 1; j < allCases.length; j++) {
        const c1 = allCases[i];
        const c2 = allCases[j];

        const res = compareTwoCases(
          {
            caseId: c1.caseId,
            subject: c1.subject,
            description: c1.description,
            category: c1.category,
            institutionId: c1.institutionId,
            institutionName: c1.institution?.name,
            createdAt: c1.createdAt,
          },
          {
            caseId: c2.caseId,
            subject: c2.subject,
            description: c2.description,
            category: c2.category,
            institutionId: c2.institutionId,
            institutionName: c2.institution?.name,
            createdAt: c2.createdAt,
          }
        );

        if (res.similarityScore >= 35) {
          const [sourceId, targetId] = c1.id < c2.id ? [c1.id, c2.id] : [c2.id, c1.id];

          await prisma.overlapSuggestion.upsert({
            where: {
              sourceCaseId_targetCaseId: {
                sourceCaseId: sourceId,
                targetCaseId: targetId,
              },
            },
            update: {
              similarityScore: res.similarityScore,
              textSimilarity: res.textSimilarity,
              institutionMatch: res.institutionMatch,
              categoryMatch: res.categoryMatch,
              dateProximity: res.dateProximity,
              matchedFactors: JSON.stringify(res.matchedFactors),
              reasons: res.reasons,
              confidenceLevel: res.confidenceLevel,
            },
            create: {
              sourceCaseId: sourceId,
              targetCaseId: targetId,
              similarityScore: res.similarityScore,
              textSimilarity: res.textSimilarity,
              institutionMatch: res.institutionMatch,
              categoryMatch: res.categoryMatch,
              dateProximity: res.dateProximity,
              matchedFactors: JSON.stringify(res.matchedFactors),
              reasons: res.reasons,
              confidenceLevel: res.confidenceLevel,
              status: "SUGGESTED",
            },
          });
          createdCount++;
        }
      }
    }
  }

  return { createdCount };
}

