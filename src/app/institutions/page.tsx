"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { AICTE_REGIONS } from "@/lib/constants";

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedRegion !== "ALL") params.set("region", selectedRegion.split(" ")[0]);

      const res = await fetch(`/api/institutions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInstitutions(data.institutions || []);
      }
    } catch (err) {
      console.error("Failed to load institutions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [selectedRegion]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInstitutions();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            AICTE Approved Institutions Directory
          </h1>
          <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">
            {institutions.length} Institutions
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Monitor institutional grievance concentration, pending inquiries, and historical resolution performance.
        </p>
      </div>

      {/* Demo Data Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Demo Notice:</strong> All institutions listed below are fictional simulated test entities created for the Smart India Hackathon prototype and do not correspond to verified official AICTE legal entities.
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by college name, PID, state, or city..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
          />
          <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
        </form>

        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#074c82] focus:outline-hidden"
        >
          <option value="ALL">All Regions</option>
          {AICTE_REGIONS.map((reg) => (
            <option key={reg} value={reg}>
              {reg}
            </option>
          ))}
        </select>
      </div>

      {/* Institutions Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#074c82]" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Loading institutions directory...</p>
        </div>
      ) : institutions.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 bg-white">
          <Building2 className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-700">No institutions found</p>
          <p className="text-xs text-slate-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {institutions.map((inst) => (
            <div
              key={inst.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#074c82] hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200">
                    PID: {inst.aictePid}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {inst.region} Region
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                  {inst.name}
                </h3>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{inst.city}, {inst.state}</span>
                </div>

                <div className="mt-1 text-[11px] text-slate-400">
                  Type: {inst.institutionType}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-slate-50 p-2">
                    <span className="text-xs text-slate-500 block">Total</span>
                    <span className="text-base font-bold text-slate-900">{inst.totalCases}</span>
                  </div>
                  <div className="rounded-md bg-amber-50 p-2">
                    <span className="text-xs text-amber-700 block">Open</span>
                    <span className="text-base font-bold text-amber-800">{inst.openCases}</span>
                  </div>
                  <div className="rounded-md bg-emerald-50 p-2">
                    <span className="text-xs text-emerald-700 block">Resolved</span>
                    <span className="text-base font-bold text-emerald-800">{inst.resolvedCases}</span>
                  </div>
                </div>

                <Link
                  href={`/institutions/${inst.id}`}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-semibold text-[#074c82] hover:bg-[#074c82] hover:text-white transition-colors"
                >
                  <span>View Case History ({inst.totalCases})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

