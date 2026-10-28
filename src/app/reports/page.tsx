"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building2,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { KpiCard } from "@/components/KpiCard";

export default function ReportsPage() {
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReportsData(data);
      }
    } catch (err) {
      console.error("Reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      window.location.href = "/api/reports/export";
    } finally {
      setTimeout(() => setExporting(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#074c82]" />
          <p className="mt-2 text-xs font-semibold text-slate-600">Generating analytics from database...</p>
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
    avgResolutionDays: 0,
    resolutionRate: 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              AICTE Grievance Analytics & Compliance Reports
            </h1>
            <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">
              Live DB
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            System-wide statistical aggregates for ministry oversight and internal institutional audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>{exporting ? "Generating CSV..." : "Export CSV Report"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-[#074c82] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0c406d] transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print to PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          title="Total Influx"
          value={summary.totalCases}
          subtitle="Total grievances filed"
          icon={<BarChart3 className="h-5 w-5" />}
          variant="blue"
        />
        <KpiCard
          title="Resolution Ratio"
          value={`${summary.resolutionRate}%`}
          subtitle="Resolved or closed"
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="emerald"
        />
        <KpiCard
          title="Avg. Resolution"
          value={`${summary.avgResolutionDays} Days`}
          subtitle="From filing to closure"
          icon={<Clock className="h-5 w-5" />}
          variant="indigo"
        />
        <KpiCard
          title="SLA Breaches"
          value={summary.overdueCount}
          subtitle="Pending beyond 30 days"
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="rose"
        />
      </div>

      {/* Breakdowns Tables Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Table 1: Category Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Grievances by Classification Domain
          </h2>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5 text-right">Count</th>
                  <th className="py-2.5 text-right">% of Influx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reportsData?.byCategory || []).map((cat: any, idx: number) => {
                  const pct = summary.totalCases > 0 ? ((cat.count / summary.totalCases) * 100).toFixed(1) : "0";
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-800">{cat.name}</td>
                      <td className="py-2 text-right font-bold text-slate-900">{cat.count}</td>
                      <td className="py-2 text-right text-slate-500">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: AICTE Bureau Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Distribution by Responsible Bureau
          </h2>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5">Bureau / Cell</th>
                  <th className="py-2.5 text-right">Assigned</th>
                  <th className="py-2.5 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reportsData?.byDepartment || []).map((dept: any, idx: number) => {
                  const pct = summary.totalCases > 0 ? ((dept.count / summary.totalCases) * 100).toFixed(1) : "0";
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-800">{dept.name}</td>
                      <td className="py-2 text-right font-bold text-slate-900">{dept.count}</td>
                      <td className="py-2 text-right text-slate-500">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Campuses Influx Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Top Institutions by Grievance Volume
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="py-2.5">Institution Name</th>
                <th className="py-2.5 text-right">Total Recorded Cases</th>
                <th className="py-2.5 text-right">Scrutiny Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(reportsData?.byInstitution || []).map((inst: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 font-semibold text-slate-800">{inst.name}</td>
                  <td className="py-2.5 text-right font-bold text-[#074c82]">{inst.count}</td>
                  <td className="py-2.5 text-right">
                    <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200">
                      Under Oversight
                    </span>
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

