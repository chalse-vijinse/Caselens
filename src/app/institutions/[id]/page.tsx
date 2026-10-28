"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  MapPin,
  FileText,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";

export default function InstitutionDetailPage() {
  const params = useParams();
  const instId = params.id as string;

  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitution() {
      try {
        const res = await fetch(`/api/institutions/${instId}`);
        if (!res.ok) throw new Error("Institution not found");
        const data = await res.json();
        setInstitution(data.institution);
      } catch (err: any) {
        console.error("Fetch institution error:", err);
        setError(err.message || "Failed to load institution details");
      } finally {
        setLoading(false);
      }
    }
    fetchInstitution();
  }, [instId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#074c82]" />
          <p className="mt-2 text-xs font-semibold text-slate-600">Retrieving institutional profile...</p>
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-600" />
          <h2 className="mt-3 text-xl font-bold text-rose-900">Institution Not Found</h2>
          <p className="mt-2 text-sm text-rose-700">{error}</p>
          <div className="mt-6">
            <Link
              href="/institutions"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#074c82] px-4 py-2 text-xs font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Directory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/institutions"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {institution.name}
              </h1>
              <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">
                PID: {institution.aictePid}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{institution.city}, {institution.state} • {institution.region} Region</span>
              <span>•</span>
              <span>Category: {institution.institutionType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Logged Cases</span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{institution.totalCases}</div>
          <p className="mt-1 text-xs text-slate-400">Lifetime grievances against campus</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 uppercase">Pending Inquiries</span>
          <div className="mt-2 text-3xl font-extrabold text-amber-900">{institution.openCases}</div>
          <p className="mt-1 text-xs text-amber-700/80">Active, under review or assigned</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase">Resolved Inquiries</span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-900">{institution.resolvedCases}</div>
          <p className="mt-1 text-xs text-emerald-700/80">Redressal directives fulfilled</p>
        </div>
      </div>

      {/* Complaints List for this institution */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Associated Grievance Cases</h2>
            <p className="text-xs text-slate-500">Detailed list of complaints filed against this campus</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {institution.complaints?.length || 0} Records
          </span>
        </div>

        {institution.complaints && institution.complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Case ID</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Filing Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {institution.complaints.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-[#074c82] whitespace-nowrap">
                      <Link href={`/cases/${c.id}`} className="hover:underline">
                        {c.caseId}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-slate-800 font-medium whitespace-nowrap">
                      {c.category}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-sm truncate">
                      {c.subject}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/cases/${c.id}`}
                        className="rounded bg-slate-100 px-3 py-1 font-semibold text-slate-700 hover:bg-[#074c82] hover:text-white transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No complaints currently on record for this institution.
          </div>
        )}
      </div>
    </div>
  );
}

