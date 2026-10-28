import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Lock,
  Search,
  CheckCircle2,
  GitCompare,
  Building,
  BarChart2,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-linear-to-b from-sky-50/70 via-white to-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold text-[#074c82] shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#074c82]"></span>
              Smart India Hackathon Prototype • AICTE Case Monitoring System
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Welcome to <span className="text-[#074c82]">CaseLens</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              AICTE Integrated Case Monitoring & Overlap Detection Dashboard. A unified institutional platform bridging transparent student grievance redressal with intelligent, multi-bureau investigation oversight.
            </p>
          </div>

          {/* TWO PRIMARY PORTAL CARDS */}
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* 1. Student Portal Card */}
            <div className="flex flex-col justify-between rounded-2xl border-2 border-sky-100 bg-white p-8 shadow-sm transition-all duration-200 hover:border-sky-300 hover:shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-sky-50 p-3 text-sky-700">
                    <FileText className="h-7 w-7" />
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    Public Access • No Login Required
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-bold text-slate-900">Student Portal</h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Students can securely lodge grievances regarding excessive capitation fees, infrastructure deficiencies, original certificate retention, ragging, or unapproved courses against AICTE-approved institutions.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Instant unique <strong>Case ID</strong> generated for tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Direct submission to AICTE Grievance Database</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Track progress anytime using registered email verification</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/submit-complaint"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#074c82] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0c406d] transition-colors"
                >
                  <span>Submit a Complaint</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/track"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Search className="h-4 w-4 text-slate-500" />
                  <span>Track Status</span>
                </Link>
              </div>
            </div>

            {/* 2. Officer / Admin Portal Card */}
            <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:border-slate-400 hover:shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-slate-100 p-3 text-slate-800">
                    <Lock className="h-7 w-7 text-[#074c82]" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-300">
                    Authorized Personnel Only
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-bold text-slate-900">Officer / Admin Portal</h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Authorized AICTE administrators, Bureau Officers, and Regional Officers can monitor active cases, conduct inquiries, assign investigating teams, inspect audit trails, and review algorithmic overlap suggestions.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#074c82] flex-shrink-0" />
                    <span>Role-Based Access Control (Admin, Bureau, Regional Office)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <GitCompare className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span>Automated Hybrid Grievance Overlap & Duplicate Detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span>Live institutional KPI metrics and compliance reports</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  <Lock className="h-4 w-4 text-slate-300" />
                  <span>Officer Login</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-2 text-center text-[11px] text-slate-500">
                  Pre-configured demo credentials available on the login page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Architected for Institutional Accountability
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              CaseLens standardizes complaint lifecycles across AICTE bureaus and regional directorates while eliminating redundant investigations.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
              <div className="rounded-lg bg-sky-100 p-2.5 text-sky-700 w-fit">
                <GitCompare className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">4-Factor Overlap Engine</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Calculates a transparent weighted similarity score combining semantic/text TF-IDF (40%), institution match (30%), category (20%), and date proximity (10%).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
              <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700 w-fit">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Strict Jurisdictional Scoping</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Server-side role enforcement guarantees Regional Officers can only inspect cases within their designated geographic territories.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
              <div className="rounded-lg bg-indigo-100 p-2.5 text-indigo-700 w-fit">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">SLA & Overdue Tracking</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Automatic SLA timers identify overdue grievances and highlight high-priority infractions like ragging or capitation fee coercion.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
              <div className="rounded-lg bg-amber-100 p-2.5 text-amber-700 w-fit">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Institutional Profiles</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Aggregated institution records showcase grievance frequency, open complaints, and historical resolution duration benchmarks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

