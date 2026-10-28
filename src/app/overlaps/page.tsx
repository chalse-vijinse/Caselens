"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitCompare,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Building2,
  Calendar,
  FileText,
  ShieldAlert,
  ArrowRight,
  Info,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { ConfidenceBadge, StatusBadge } from "@/components/Badge";
import { OverlapScoreCard } from "@/components/OverlapScoreCard";
import { formatDate } from "@/lib/utils";

export default function OverlapsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalCount: 0,
    highConfidenceCount: 0,
    confirmedCount: 0,
    pendingReviewCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterConfidence, setFilterConfidence] = useState("ALL");

  // Review Modal State
  const [reviewingItem, setReviewingItem] = useState<any | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"CONFIRMED_OVERLAP" | "REJECTED">("CONFIRMED_OVERLAP");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchOverlaps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      if (filterConfidence !== "ALL") params.set("confidence", filterConfidence);

      const res = await fetch(`/api/overlaps?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to load overlaps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverlaps();
  }, [filterStatus, filterConfidence]);

  const handleTriggerScan = async () => {
    setScanning(true);
    setScanMessage(null);
    try {
      const res = await fetch("/api/overlaps/scan", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setScanMessage(data.message || "Overlap detection scan completed successfully.");
        fetchOverlaps();
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setScanning(false);
    }
  };

  const handleOpenReview = (item: any, decision: "CONFIRMED_OVERLAP" | "REJECTED") => {
    setReviewingItem(item);
    setReviewDecision(decision);
    setReviewNotes(
      decision === "CONFIRMED_OVERLAP"
        ? "Corroborated: Identical institutional grievance pattern identified across complainants."
        : "Rejected: Incidents represent independent administrative occurrences."
    );
    setReviewError(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem || !reviewNotes.trim()) return;

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await fetch(`/api/overlaps/${reviewingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewDecision,
          reviewNotes: reviewNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || "Failed to persist review decision.");
      } else {
        setReviewingItem(null);
        fetchOverlaps();
      }
    } catch (err) {
      console.error("Review submit error:", err);
      setReviewError("Network error while submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Algorithmic Overlap & Duplicate Detection
            </h1>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              Advisory System
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automated multi-factor similarity analysis linking related student complaints across departments and institutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerScan}
            disabled={scanning}
            className="flex items-center gap-1.5 rounded-lg bg-[#074c82] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0c406d] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`} />
            <span>{scanning ? "Scanning Registry..." : "Re-Run Overlap Scan"}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs font-medium text-sky-900">
          <CheckCircle2 className="h-4 w-4 text-sky-600 flex-shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Institutional Safeguard Callout */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Regulatory Safeguard:</span> Algorithmic overlap matches are advisory indicators only. The system <strong>never automatically merges, closes, or deletes</strong> complaints. Authorized officers must manually confirm or dismiss suggestions, preserving the full audit trail.
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <span className="text-xs text-slate-500 font-semibold block uppercase">Total Suggestions</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.totalCount}</span>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-center">
          <span className="text-xs text-rose-700 font-semibold block uppercase">High Confidence</span>
          <span className="text-2xl font-black text-rose-800 mt-1 block">{stats.highConfidenceCount}</span>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-center">
          <span className="text-xs text-amber-700 font-semibold block uppercase">Pending Review</span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">{stats.pendingReviewCount}</span>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
          <span className="text-xs text-emerald-700 font-semibold block uppercase">Confirmed Linked</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">{stats.confirmedCount}</span>
        </div>
      </div>

      {/* Hybrid Formula Explanation Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Info className="h-4 w-4 text-[#074c82]" />
          Hybrid Weighted Scoring Formulation (SIH Baseline)
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          The similarity score is computed deterministically across four orthogonal verification dimensions:
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-medium">
          <div className="rounded-lg bg-sky-50 p-2.5 text-sky-900 border border-sky-200">
            <span className="font-bold block">40% Text & Semantics</span>
            <span className="text-[11px] text-sky-700">TF-IDF Vectorization & Bigram Cosine</span>
          </div>
          <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-900 border border-indigo-200">
            <span className="font-bold block">30% Institution Match</span>
            <span className="text-[11px] text-indigo-700">AICTE PID & Fuzzy Campus Name</span>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-900 border border-emerald-200">
            <span className="font-bold block">20% Grievance Category</span>
            <span className="text-[11px] text-emerald-700">Classification & Sub-domain Match</span>
          </div>
          <div className="rounded-lg bg-amber-50 p-2.5 text-amber-900 border border-amber-200">
            <span className="font-bold block">10% Date Window</span>
            <span className="text-[11px] text-amber-700">Temporal Proximity & Incident Window</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 mr-2">Review Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-[#074c82]"
            >
              <option value="ALL">All Review States</option>
              <option value="SUGGESTED">Pending Officer Review</option>
              <option value="CONFIRMED_OVERLAP">Confirmed Overlaps</option>
              <option value="REJECTED">Dismissed / Rejected</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 mr-2">Confidence Level:</label>
            <select
              value={filterConfidence}
              onChange={(e) => setFilterConfidence(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-[#074c82]"
            >
              <option value="ALL">All Confidence Levels</option>
              <option value="HIGH_CONFIDENCE">High Confidence (70%+)</option>
              <option value="POTENTIAL_MATCH">Potential Match (50-69%)</option>
              <option value="NEEDS_REVIEW">Needs Review (35-49%)</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500">
          Showing <strong>{suggestions.length}</strong> matching suggestions
        </span>
      </div>

      {/* Suggestions List */}
      {loading ? (
        <div className="p-16 text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#074c82]" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Evaluating grievance pairs...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 bg-white">
          <GitCompare className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-700">No overlap suggestions match criteria</p>
          <p className="text-xs text-slate-500">Click &apos;Re-Run Overlap Scan&apos; to recompute matches across newly submitted complaints.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-6 shadow-xs transition-all ${
                item.status === "CONFIRMED_OVERLAP"
                  ? "border-emerald-300 ring-1 ring-emerald-200"
                  : item.status === "REJECTED"
                  ? "border-slate-200 opacity-60"
                  : "border-slate-300 hover:border-[#074c82]"
              }`}
            >
              {/* Top Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <ConfidenceBadge level={item.confidenceLevel} />
                  {item.status === "CONFIRMED_OVERLAP" && (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      ✓ Confirmed Overlap
                    </span>
                  )}
                  {item.status === "REJECTED" && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                      ✕ Rejected by Officer
                    </span>
                  )}
                  {item.status === "SUGGESTED" && (
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                      Pending Scrutiny
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.status === "SUGGESTED" ? (
                    <>
                      <button
                        onClick={() => handleOpenReview(item, "CONFIRMED_OVERLAP")}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Confirm Overlap</span>
                      </button>
                      <button
                        onClick={() => handleOpenReview(item, "REJECTED")}
                        className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-slate-500">
                      Reviewed by {item.reviewedBy?.name || "Officer"} ({formatDate(item.reviewedAt)})
                    </div>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison Grid */}
              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Case 1 (Source) */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#074c82]">
                      <Link href={`/cases/${item.sourceCase.id}`} className="hover:underline flex items-center gap-1">
                        <span>{item.sourceCase.caseId}</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </Link>
                    </span>
                    <StatusBadge status={item.sourceCase.status} />
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-slate-900 leading-snug">
                    {item.sourceCase.subject}
                  </h4>

                  <div className="mt-3 space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                    <p>
                      <strong>Institution:</strong> {item.sourceCase.institution?.name} (PID: {item.sourceCase.institution?.aictePid})
                    </p>
                    <p>
                      <strong>Category:</strong> {item.sourceCase.category}
                    </p>
                    <p>
                      <strong>Complainant:</strong> {item.sourceCase.studentName}
                    </p>
                    <p>
                      <strong>Filing Date:</strong> {formatDate(item.sourceCase.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Case 2 (Target) */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#074c82]">
                      <Link href={`/cases/${item.targetCase.id}`} className="hover:underline flex items-center gap-1">
                        <span>{item.targetCase.caseId}</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </Link>
                    </span>
                    <StatusBadge status={item.targetCase.status} />
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-slate-900 leading-snug">
                    {item.targetCase.subject}
                  </h4>

                  <div className="mt-3 space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                    <p>
                      <strong>Institution:</strong> {item.targetCase.institution?.name} (PID: {item.targetCase.institution?.aictePid})
                    </p>
                    <p>
                      <strong>Category:</strong> {item.targetCase.category}
                    </p>
                    <p>
                      <strong>Complainant:</strong> {item.targetCase.studentName}
                    </p>
                    <p>
                      <strong>Filing Date:</strong> {formatDate(item.targetCase.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Similarity Score Breakdown Card */}
              <div className="mt-5">
                <OverlapScoreCard
                  similarityScore={item.similarityScore}
                  textSimilarity={item.textSimilarity}
                  institutionMatch={item.institutionMatch}
                  categoryMatch={item.categoryMatch}
                  dateProximity={item.dateProximity}
                  matchedFactors={item.matchedFactors}
                  reasons={item.reasons}
                  confidenceLevel={item.confidenceLevel}
                />
              </div>

              {/* Review Notes Display (if already reviewed) */}
              {item.reviewNotes && (
                <div className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
                  <span className="font-bold">Officer Scrutiny Finding: </span>
                  {item.reviewNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Confirmation Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              {reviewDecision === "CONFIRMED_OVERLAP" ? "Confirm Grievance Overlap" : "Dismiss Overlap Suggestion"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Record your official inquiry finding for auditing and cross-bureau coordination.
            </p>

            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
              <div>
                <strong>Pair:</strong> {reviewingItem.sourceCase.caseId} ↔ {reviewingItem.targetCase.caseId}
              </div>
              <div>
                <strong>Similarity:</strong> {reviewingItem.similarityScore}% ({reviewingItem.confidenceLevel})
              </div>
            </div>

            {reviewError && (
              <div className="mt-3 rounded bg-rose-50 p-2 text-xs text-rose-700">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Officer Scrutiny Notes & Directives <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="State justification (e.g. Same incident reported by batchmates, or distinct isolated occurrences)..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-[#074c82]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold text-white ${
                    reviewDecision === "CONFIRMED_OVERLAP"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {submittingReview ? "Persisting..." : "Submit Finding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

