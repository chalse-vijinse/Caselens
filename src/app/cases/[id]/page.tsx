"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  User,
  Shield,
  GitCompare,
  MessageSquare,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Send,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { StatusBadge, PriorityBadge, RoleBadge, ConfidenceBadge } from "@/components/Badge";
import { OverlapScoreCard } from "@/components/OverlapScoreCard";
import { formatDate, formatDateTime } from "@/lib/utils";
import { CASE_STATUSES, CASE_PRIORITIES, AICTE_BUREAUS } from "@/lib/constants";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseIdOrId = params.id as string;

  const [caseData, setCaseData] = useState<any>(null);
  const [overlaps, setOverlaps] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [officersList, setOfficersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status & Assignment Form
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Remark Form
  const [newRemark, setNewRemark] = useState("");
  const [submittingRemark, setSubmittingRemark] = useState(false);

  const fetchCase = async () => {
    try {
      // Current user
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const meData = await meRes.json();
      setCurrentUser(meData.user);

      // Case details
      const res = await fetch(`/api/complaints/${caseIdOrId}`);
      if (!res.ok) {
        if (res.status === 403) {
          setError("Access Denied: This case is located outside your authorized regional jurisdiction.");
          setLoading(false);
          return;
        }
        throw new Error("Failed to load case");
      }

      const data = await res.json();
      setCaseData(data.case);
      setOverlaps(data.overlaps || []);

      setSelectedStatus(data.case.status);
      setSelectedPriority(data.case.priority);
      setSelectedDepartment(data.case.department || "Grievance Redressal Cell");
      setSelectedOfficerId(data.case.assignedOfficerId || "");
      setResolutionNotes(data.case.resolutionNotes || "");

      // If Admin or Bureau, load officers list for assignment dropdown
      if (meData.user.role === "ADMIN" || meData.user.role === "BUREAU_OFFICER") {
        const usersRes = await fetch("/api/users");
        if (usersRes.ok) {
          const uData = await usersRes.json();
          setOfficersList(uData.users || []);
        }
      }
    } catch (err: any) {
      console.error("Case fetch error:", err);
      setError(err.message || "Failed to load case details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [caseIdOrId]);

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess(null);
    setError(null);

    try {
      const res = await fetch(`/api/complaints/${caseData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          priority: selectedPriority,
          department: selectedDepartment,
          assignedOfficerId: selectedOfficerId || null,
          resolutionNotes: resolutionNotes || null,
          reason: statusReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update case");
      } else {
        setUpdateSuccess("Case details and status transitions updated successfully.");
        setStatusReason("");
        fetchCase();
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update case");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemark.trim()) return;

    setSubmittingRemark(true);
    try {
      const res = await fetch(`/api/complaints/${caseData.id}/remarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remark: newRemark.trim(),
          isInternal: true,
        }),
      });

      if (res.ok) {
        setNewRemark("");
        fetchCase();
      }
    } catch (err) {
      console.error("Remark error:", err);
    } finally {
      setSubmittingRemark(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#074c82]" />
          <p className="mt-2 text-xs font-semibold text-slate-600">Retrieving case record from database...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-600" />
          <h2 className="mt-3 text-xl font-bold text-rose-900">Unable to View Case</h2>
          <p className="mt-2 text-sm text-rose-700">{error || "Case record not found."}</p>
          <div className="mt-6">
            <Link
              href="/cases"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#074c82] px-4 py-2 text-xs font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cases Registry</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/cases"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-black text-[#074c82]">{caseData.caseId}</span>
              <StatusBadge status={caseData.status} />
              <PriorityBadge priority={caseData.priority} />
            </div>
            <p className="text-xs text-slate-500">
              Logged on {formatDateTime(caseData.createdAt)} • Target SLA: {formatDate(caseData.dueDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {caseData.isDemo && (
            <span className="rounded bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
              Demo Seed Record
            </span>
          )}
        </div>
      </div>

      {updateSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{updateSuccess}</span>
        </div>
      )}

      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Case Information & Narrative (2 spans) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section: Grievance Statement */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
              Grievance Narrative & Particulars
            </h2>

            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-500">Subject</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{caseData.subject}</h3>
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-500">Detailed Statement</span>
              <div className="mt-1.5 whitespace-pre-line rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 border border-slate-200">
                {caseData.description}
              </div>
            </div>

            {caseData.referenceNumber && (
              <div className="mt-4 text-xs">
                <span className="text-slate-500">Complainant Internal Reference: </span>
                <span className="font-mono font-semibold text-slate-800">{caseData.referenceNumber}</span>
              </div>
            )}
          </div>

          {/* Section: Complainant & Institution Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Institution Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Building2 className="h-3.5 w-3.5 text-[#074c82]" />
                Reported Institution
              </h3>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="font-bold text-slate-900 text-sm">
                  <Link
                    href={`/institutions/${caseData.institution?.id}`}
                    className="hover:text-[#074c82] hover:underline flex items-center gap-1"
                  >
                    <span>{caseData.institution?.name}</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </Link>
                </div>
                <div className="text-slate-600">
                  AICTE PID: <span className="font-mono font-semibold">{caseData.institution?.aictePid}</span>
                </div>
                <div className="text-slate-600">
                  Location: {caseData.institution?.city}, {caseData.institution?.state}
                </div>
                <div className="text-slate-600">
                  Jurisdiction Region: <span className="font-semibold text-slate-800">{caseData.institution?.region}</span>
                </div>
              </div>
            </div>

            {/* Complainant Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <User className="h-3.5 w-3.5 text-[#074c82]" />
                Complainant Student
              </h3>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="font-bold text-slate-900 text-sm">{caseData.studentName}</div>
                <div className="text-slate-600">
                  Email: <span className="font-mono text-slate-800">{caseData.studentEmail}</span>
                </div>
                <div className="text-slate-600">
                  Phone: <span className="font-mono text-slate-800">{caseData.studentPhone || "Not provided"}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Confidential record • Visible only to authorized officers
                </div>
              </div>
            </div>
          </div>

          {/* Section: Overlap Suggestions & Duplicate Advisory */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Algorithmic Overlap & Duplicate Advisory ({overlaps.length})
                </h3>
              </div>
              <Link
                href="/overlaps"
                className="text-xs font-semibold text-[#074c82] hover:underline"
              >
                Inspect Global Overlaps →
              </Link>
            </div>

            {overlaps.length === 0 ? (
              <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-xs text-slate-500 border border-slate-200">
                No overlapping or duplicate complaints detected for this case at the current threshold.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {overlaps.map((overlap) => (
                  <div key={overlap.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge level={overlap.confidenceLevel} />
                        <span className="font-mono text-xs font-bold text-[#074c82]">
                          Matched with:{" "}
                          <Link href={`/cases/${overlap.relatedCase.id}`} className="hover:underline">
                            {overlap.relatedCase.caseId}
                          </Link>
                        </span>
                      </div>
                      <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">
                        {overlap.similarityScore}% Weighted Match
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-semibold text-slate-800">
                      {overlap.relatedCase.subject}
                    </p>

                    <div className="mt-3">
                      <OverlapScoreCard
                        similarityScore={overlap.similarityScore}
                        textSimilarity={overlap.textSimilarity}
                        institutionMatch={overlap.institutionMatch}
                        categoryMatch={overlap.categoryMatch}
                        dateProximity={overlap.dateProximity}
                        matchedFactors={overlap.matchedFactors}
                        reasons={overlap.reasons}
                        confidenceLevel={overlap.confidenceLevel}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Internal Officer Remarks */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#074c82]" />
              Internal Case Remarks ({caseData.remarks?.length || 0})
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Permitted for authorized officers only. Never revealed on student tracking view.
            </p>

            {/* Existing Remarks List */}
            <div className="mt-4 space-y-3">
              {(caseData.remarks || []).map((rem: any) => (
                <div key={rem.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <span>{rem.user?.name}</span>
                      <RoleBadge role={rem.user?.role} />
                    </div>
                    <span>{formatDateTime(rem.createdAt)}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{rem.remark}</p>
                </div>
              ))}
            </div>

            {/* Add Remark Input Form */}
            <form onSubmit={handleAddRemark} className="mt-5 border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Add Official Internal Note / Directive
              </label>
              <textarea
                rows={3}
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Record observation, telephonic verification notes, or investigation instructions..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingRemark || !newRemark.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#074c82] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c406d] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Post Remark</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Case Actions, Status Transitions & Audit Timeline */}
        <div className="space-y-6">
          {/* Action Box: Status, Priority, Assignment */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
              Investigation Control
            </h3>

            <form onSubmit={handleUpdateCase} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Lifecycle Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:border-[#074c82]"
                >
                  {CASE_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Priority Level</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#074c82]"
                >
                  {CASE_PRIORITIES.map((pr) => (
                    <option key={pr.value} value={pr.value}>
                      {pr.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Responsible AICTE Bureau</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#074c82]"
                >
                  {AICTE_BUREAUS.map((bur) => (
                    <option key={bur} value={bur}>
                      {bur}
                    </option>
                  ))}
                </select>
              </div>

              {/* Officer Assignment: Restricted by Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Investigating Officer</label>
                {currentUser?.role === "REGIONAL_OFFICER" ? (
                  <div className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                    {caseData.assignedOfficer ? caseData.assignedOfficer.name : "Unassigned (Regional Pool)"}
                  </div>
                ) : (
                  <select
                    value={selectedOfficerId}
                    onChange={(e) => setSelectedOfficerId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#074c82]"
                  >
                    <option value="">-- Unassigned --</option>
                    {officersList.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name} ({off.role.replace("_", " ")})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Official Resolution Remarks (Shown to student on status track) */}
              {(selectedStatus === "RESOLVED" || selectedStatus === "CLOSED") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Resolution Findings & Directives <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter official resolution summary, directive issued to institution, or refund confirmation..."
                    className="mt-1 w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:border-[#074c82]"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    This note will be visible to the student upon entering their verified email.
                  </p>
                </div>
              )}

              {/* Status Change Audit Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Audit Log Justification
                </label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Scrutiny committee meeting conclusion"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#074c82]"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#074c82] py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0c406d] transition-colors disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Persisting Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Lifecycle Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Section: Chronological Audit History */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-[#074c82]" />
              Immutable Status Audit Log
            </h3>

            <div className="mt-4 flow-root">
              <ul className="-mb-6">
                {(caseData.statusHistory || []).map((hist: any, idx: number) => {
                  const isLast = idx === caseData.statusHistory.length - 1;
                  return (
                    <li key={hist.id} className="relative pb-6">
                      {!isLast && (
                        <span
                          className="absolute left-3 top-3 -ml-px h-full w-0.5 bg-slate-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex items-start space-x-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-4 ring-white">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#074c82]" />
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5 text-xs">
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>{hist.newStatus}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatDateTime(hist.createdAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-600">{hist.reason}</p>
                          {hist.changedBy && (
                            <p className="text-[10px] text-slate-400">By {hist.changedBy.name}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

