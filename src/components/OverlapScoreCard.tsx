import React from "react";
import { ConfidenceBadge } from "./Badge";

interface OverlapScoreCardProps {
  similarityScore: number;
  textSimilarity: number;
  institutionMatch: number;
  categoryMatch: number;
  dateProximity: number;
  matchedFactors: string[];
  reasons: string;
  confidenceLevel: string;
  compact?: boolean;
}

export function OverlapScoreCard({
  similarityScore,
  textSimilarity,
  institutionMatch,
  categoryMatch,
  dateProximity,
  matchedFactors = [],
  reasons,
  confidenceLevel,
  compact = false,
}: OverlapScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-rose-700 bg-rose-50 border-rose-300";
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-300";
    return "text-sky-700 bg-sky-50 border-sky-300";
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 70) return "bg-rose-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-sky-500";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg border font-bold ${getScoreColor(similarityScore)}`}>
          <span className="text-sm leading-none">{similarityScore}%</span>
          <span className="text-[9px] uppercase tracking-tighter opacity-80">Match</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <ConfidenceBadge level={confidenceLevel} />
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{matchedFactors.slice(0, 2).join(" • ")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ConfidenceBadge level={confidenceLevel} />
            <span className="text-xs text-slate-500">Automated Advisory Model</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            Hybrid Multi-Factor Similarity Assessment
          </p>
        </div>

        <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${getScoreColor(similarityScore)}`}>
          <span className="text-xs font-semibold uppercase tracking-wider">Weighted Score:</span>
          <span className="text-xl font-extrabold">{similarityScore}%</span>
        </div>
      </div>

      {/* 4-Factor Weighted Breakdown Bars */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Text Similarity</span>
            <span className="font-bold text-slate-900">{textSimilarity}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200">
            <div className={`h-1.5 rounded-full ${getScoreProgressColor(textSimilarity)}`} style={{ width: `${textSimilarity}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-slate-600">Weight: 40% (TF-IDF & N-gram)</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Institution</span>
            <span className="font-bold text-slate-900">{institutionMatch}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200">
            <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${institutionMatch}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-slate-600">Weight: 30% (PID / Name match)</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Category</span>
            <span className="font-bold text-slate-900">{categoryMatch}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200">
            <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${categoryMatch}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-slate-600">Weight: 20% (Domain classification)</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Date Window</span>
            <span className="font-bold text-slate-900">{dateProximity}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200">
            <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${dateProximity}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-slate-600">Weight: 10% (Temporal cluster)</p>
        </div>
      </div>

      {/* Matched Factors Pills */}
      {matchedFactors.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-600">Key Matched Indicators:</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {matchedFactors.map((factor, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 shadow-2xs"
              >
                ✓ {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Algorithmic Reason */}
      {reasons && (
        <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-xs text-amber-900">
          <span className="font-semibold">System Advisory Rationale: </span>
          {reasons}
        </div>
      )}
    </div>
  );
}

