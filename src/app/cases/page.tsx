"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Building2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";
import { COMPLAINT_CATEGORIES, CASE_STATUSES, CASE_PRIORITIES, AICTE_BUREAUS } from "@/lib/constants";

function CasesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [officerScope, setOfficerScope] = useState<any>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [priority, setPriority] = useState(searchParams.get("priority") || "ALL");
  const [department, setDepartment] = useState(searchParams.get("department") || "ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalCount: 0, totalPages: 1 });

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);
      if (category !== "ALL") params.set("category", category);
      if (priority !== "ALL") params.set("priority", priority);
      if (department !== "ALL") params.set("department", department);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/complaints?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load cases");
      }

      const data = await res.json();
      setCases(data.cases || []);
      setPagination(data.pagination || { page: 1, limit: 15, totalCount: 0, totalPages: 1 });
      setOfficerScope(data.officerScope);
    } catch (err) {
      console.error("Error fetching cases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, status, category, priority, department]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCases();
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setCategory("ALL");
    setPriority("ALL");
    setDepartment("ALL");
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Institutional Grievance Case Registry
            </h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
              {pagination.totalCount} Cases
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Search, filter, assign investigating officers, and manage complaint lifecycle states.
          </p>
        </div>

        {/* Regional officer notice */}
        {officerScope?.role === "REGIONAL_OFFICER" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
            Jurisdiction: <strong>{officerScope.region} Region Only</strong>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Case ID, student name, email, or institution..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-[#074c82] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c406d] transition-colors"
          >
            <span>Search</span>
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#074c82] focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              {CASE_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#074c82] focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              {CASE_PRIORITIES.map((pr) => (
                <option key={pr.value} value={pr.value}>
                  {pr.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#074c82] focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Responsible Bureau</label>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#074c82] focus:outline-hidden"
            >
              <option value="ALL">All Bureaus</option>
              {AICTE_BUREAUS.map((bur) => (
                <option key={bur} value={bur}>
                  {bur}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#074c82]" />
            <p className="mt-2 text-xs font-semibold text-slate-500">Querying cases database...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-700">No complaints found</p>
            <p className="text-xs text-slate-500">Try loosening your search filters or keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Case ID</th>
                  <th className="px-5 py-3">Institution & Region</th>
                  <th className="px-5 py-3">Category & Subject</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Assigned Officer</th>
                  <th className="px-5 py-3">Filing Date</th>
                  <th className="px-5 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#074c82] whitespace-nowrap">
                      <Link href={`/cases/${c.id}`} className="hover:underline">
                        {c.caseId}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <div className="font-semibold text-slate-900 truncate">{c.institution?.name}</div>
                      <div className="text-[11px] text-slate-400">{c.institution?.region} • {c.institution?.state}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-[280px]">
                      <div className="font-semibold text-slate-800 truncate">{c.category}</div>
                      <div className="text-[11px] text-slate-500 truncate">{c.subject}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                      {c.assignedOfficer ? (
                        <span>{c.assignedOfficer.name.split(" ")[0]} ({c.assignedOfficer.role.substring(0, 3)})</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
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
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-600">
          <div>
            Showing <strong>{(pagination.page - 1) * pagination.limit + (cases.length > 0 ? 1 : 0)}</strong> to{" "}
            <strong>{(pagination.page - 1) * pagination.limit + cases.length}</strong> of <strong>{pagination.totalCount}</strong> cases
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 font-medium hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <span className="font-semibold text-slate-700">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 font-medium hover:bg-slate-100 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CasesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading cases registry...</div>}>
      <CasesContent />
    </Suspense>
  );
}

