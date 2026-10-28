"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  TrendingUp,
  RefreshCw,
  Building2,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Calendar,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, PriorityBadge, RoleBadge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";

const COLORS = ["#0284c7", "#f59e0b", "#8b5cf6", "#6366f1", "#10b981", "#64748b"];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [reportsData, setReportsData] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      // 1. Verify user session
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await userRes.json();
      setCurrentUser(userData.user);

      // 2. Fetch reports analytics
      const repRes = await fetch("/api/reports");
      if (repRes.ok) {
        const repData = await repRes.json();
        setReportsData(repData);
      }

      // 3. Fetch recent 8 cases
      const casesRes = await fetch("/api/complaints?limit=8");
      if (casesRes.ok) {
        const cData = await casesRes.json();
        setRecentCases(cData.cases || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#074c82]" />
          <p className="mt-2 text-xs font-semibold text-slate-600">Loading AICTE Institutional Metrics...</p>
        </div>
      </div>
    );
  }

  const summary = reportsData?.summary || {
    totalCases: 0,
    submittedCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    overdueCount: 0,
    overlapCount: 0,
    avgResolutionDays: 0,
    resolutionRate: 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              AICTE Integrated Case Monitoring Dashboard
            </h1>
            <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">
              Live DB
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>Welcome, <strong>{currentUser?.name}</strong></span>
            <span>•</span>
            <RoleBadge role={currentUser?.role || "OFFICER"} />
            {currentUser?.region && (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-800 border border-amber-200">
                Region: {currentUser.region}
              </span>
            )}
            <span>•</span>
            <span className="text-slate-400">Jurisdictional scoping strictly active</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-sky-600" : ""}`} />
            <span>Refresh Metrics</span>
          </button>
          <Link
            href="/cases"
            className="flex items-center gap-1.5 rounded-lg bg-[#074c82] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0c406d] transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Explore All Cases</span>
          </Link>
        </div>
      </div>

      {/* Demo Records Notice Banner */}
      <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 text-xs text-sky-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-sky-500"></span>
          <span>
            Database State: <strong>Connected to SQLite (Prisma)</strong>. Real-time updates reflect newly submitted complaints, status modifications, and remarks immediately.
          </span>
        </div>
        <span className="hidden sm:inline-block rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
          Demo Dataset Active
        </span>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          title="Total Grievances"
          value={summary.totalCases}
          subtitle="All recorded complaints"
          icon={<FileText className="h-5 w-5" />}
          variant="blue"
        />
        <KpiCard
          title="New / Submitted"
          value={summary.submittedCount}
          subtitle="Pending initial triage"
          icon={<Clock className="h-5 w-5" />}
          variant="indigo"
        />
        <KpiCard
          title="In Progress"
          value={summary.inProgressCount}
          subtitle="Under active inquiry"
          icon={<Layers className="h-5 w-5" />}
          variant="amber"
        />
        <KpiCard
          title="Resolved Cases"
          value={summary.resolvedCount}
          subtitle={`${summary.resolutionRate}% resolution rate`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="emerald"
        />
        <KpiCard
          title="Overdue (SLA)"
          value={summary.overdueCount}
          subtitle="Beyond 30-day target"
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="rose"
        />
        <KpiCard
          title="Potential Overlaps"
          value={summary.overlapCount}
          subtitle="Algorithmic matches"
          icon={<GitCompare className="h-5 w-5" />}
          variant="purple"
        />
      </div>

      {/* Charts Row 1: Status Distribution & Monthly Influx Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution Pie / Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#074c82]" />
              Case Distribution by Status
            </h2>
            <span className="text-xs text-slate-500">Live Breakdown</span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportsData?.byStatus || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                />
                <Bar dataKey="count" name="Total Cases" radius={[4, 4, 0, 0]}>
                  {(reportsData?.byStatus || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Line */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Monthly Grievance Influx Trend
            </h2>
            <span className="text-xs text-slate-500">Temporal Volume</span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportsData?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey="cases"
                  name="Grievances Filed"
                  stroke="#074c82"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#074c82" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Category Breakdown & Bureau Allocation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* By Category */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Cases by Grievance Domain</h2>
            <span className="text-xs text-slate-500">Top Categories</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={(reportsData?.byCategory || []).slice(0, 5)}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 10, fill: "#334155" }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                />
                <Bar dataKey="count" name="Cases" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Department / Bureau */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Distribution Across AICTE Bureaus</h2>
            <span className="text-xs text-slate-500">Responsible Cells</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={(reportsData?.byDepartment || []).slice(0, 5)}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 10, fill: "#334155" }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                />
                <Bar dataKey="count" name="Cases" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Cases Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Grievance Cases</h2>
            <p className="text-xs text-slate-500">Latest complaints received in database</p>
          </div>
          <Link
            href="/cases"
            className="flex items-center gap-1 text-xs font-semibold text-[#074c82] hover:underline"
          >
            <span>View All ({summary.totalCases})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Case ID</th>
                <th className="px-6 py-3">Institution</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Filing Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3 font-mono font-bold text-[#074c82] whitespace-nowrap">
                    <Link href={`/cases/${c.id}`} className="hover:underline">
                      {c.caseId}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-slate-800 font-medium max-w-xs truncate">
                    {c.institution?.name}
                  </td>
                  <td className="px-6 py-3 text-slate-600 max-w-xs truncate">
                    {c.category}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/cases/${c.id}`}
                      className="rounded bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 hover:bg-[#074c82] hover:text-white transition-colors"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

