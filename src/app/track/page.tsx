"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  RefreshCw,
  FileText,
} from "lucide-react";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatDateTime } from "@/lib/utils";

interface TrackedComplaint {
  caseId: string;
  studentName: string;
  institutionName: string;
  category: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string | null;
  statusProgression: Array<{
    status: string;
    timestamp: string;
    note: string;
  }>;
}

function TrackComplaintContent() {
  const searchParams = useSearchParams();
  const [caseId, setCaseId] = useState(searchParams.get("caseId") || "");
  const [studentEmail, setStudentEmail] = useState(searchParams.get("email") || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complaint, setComplaint] = useState<TrackedComplaint | null>(null);

  // Auto-search if parameters are passed in URL
  useEffect(() => {
    const queryCaseId = searchParams.get("caseId");
    const queryEmail = searchParams.get("email");
    if (queryCaseId && queryEmail) {
      handleTrackQuery(queryCaseId, queryEmail);
    }
  }, [searchParams]);

  const handleTrackQuery = async (id: string, email: string) => {
    setError(null);
    setLoading(true);
    setComplaint(null);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: id.trim(),
          studentEmail: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No complaint matched the provided details.");
      } else {
        setComplaint(data.complaint);
      }
    } catch (err) {
      console.error("Track error:", err);
      setError("Failed to query case status due to a connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId.trim() || !studentEmail.trim()) {
      setError("Please provide both the Case ID and the registered email address.");
      return;
    }
    handleTrackQuery(caseId, studentEmail);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#074c82] uppercase tracking-wider">
          <Search className="h-4 w-4" />
          <span>Case Redressal Tracker</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Track Grievance Status
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your unique Case ID along with the registered email address used during submission to inspect real-time progress and official resolution notices.
        </p>
      </div>

      {/* Security Verification Callout */}
      <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-900 flex items-start gap-3">
        <Lock className="h-4 w-4 text-sky-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Student Confidentiality Safeguard:</span> Case records are never exposed solely by typing a Case ID. For identity verification, the server validates that the email provided strictly corresponds with the registered complainant record.
        </div>
      </div>

      {/* Query Form */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              AICTE Case ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="e.g. AICTE-2026-FEE001"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Registered Student Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="aditya.v.student@example.com"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-500">
              Demo sample: Try Case ID <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-800">AICTE-2026-FEE001</code> with email <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-800">aditya.v.student@example.com</code>
            </span>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#074c82] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0c406d] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying Record...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Verify & Track</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
          <div>
            <span className="font-bold">Verification Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Case Details View */}
      {complaint && (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Case Identifier</span>
                <h2 className="text-2xl font-mono font-bold text-[#074c82]">{complaint.caseId}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Current Status:</span>
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Institution Name:</span>
                <p className="mt-0.5 font-bold text-slate-900">{complaint.institutionName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Grievance Category:</span>
                <p className="mt-0.5 font-bold text-slate-900">{complaint.category}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Filing Date:</span>
                <p className="mt-0.5 text-slate-800 font-semibold">{formatDate(complaint.createdAt)}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Complainant:</span>
                <p className="mt-0.5 text-slate-800 font-semibold">{complaint.studentName}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-medium">Subject:</span>
                <p className="mt-0.5 font-semibold text-slate-900">{complaint.subject}</p>
              </div>
            </div>

            {/* Official Resolution Notes (If Resolved) */}
            {complaint.resolutionNotes && (
              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Official Redressal & Resolution Order:
                </div>
                <p className="mt-1 leading-relaxed">{complaint.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Timeline of Redressal Progression */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#074c82]" />
              Redressal Lifecycle Progression
            </h3>

            <div className="mt-6 flow-root">
              <ul className="-mb-8">
                {complaint.statusProgression.map((item, idx) => {
                  const isLast = idx === complaint.statusProgression.length - 1;
                  return (
                    <li key={idx} className="relative pb-8">
                      {!isLast && (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex items-start space-x-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-[#074c82] ring-4 ring-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1 pt-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{item.status}</span>
                            <span className="text-slate-400 font-mono">{formatDateTime(item.timestamp)}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{item.note}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackComplaintPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading tracking interface...</div>}>
      <TrackComplaintContent />
    </Suspense>
  );
}

