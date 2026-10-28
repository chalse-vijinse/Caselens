"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, FileText, Search, LayoutDashboard, Building2, GitCompare, BarChart3, Settings, LogOut, LogIn, Menu, X, User } from "lucide-react";
import { RoleBadge } from "./Badge";

interface OfficerUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "BUREAU_OFFICER" | "REGIONAL_OFFICER";
  department?: string | null;
  region?: string | null;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<OfficerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const isOfficerRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/cases") ||
    pathname.startsWith("/institutions") ||
    pathname.startsWith("/overlaps") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top AICTE Gov Banner */}
      <div className="bg-[#0b1b36] px-4 py-1 text-white text-[11px] font-medium tracking-wide">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>All India Council for Technical Education (AICTE) • Ministry of Education</span>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-slate-300">
            <span>Prototype Version 1.0 (Smart India Hackathon)</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#074c82] text-white shadow-md">
            <Shield className="h-6 w-6 text-sky-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-[#074c82]">CaseLens</span>
              <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
                AICTE
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Integrated Case Monitoring & Overlap Dashboard
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {/* Public links always available */}
          <Link
            href="/"
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              pathname === "/" ? "bg-slate-100 text-[#074c82]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Home
          </Link>
          <Link
            href="/submit-complaint"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              pathname === "/submit-complaint"
                ? "bg-sky-50 text-[#074c82] border border-sky-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-sky-600" />
            Submit Complaint
          </Link>
          <Link
            href="/track"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              pathname === "/track"
                ? "bg-sky-50 text-[#074c82] border border-sky-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Search className="h-3.5 w-3.5 text-slate-500" />
            Track Status
          </Link>

          {/* Officer-only links displayed only when authenticated */}
          {user && (
            <>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-[#074c82] text-white"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <Link
                href="/cases"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  pathname.startsWith("/cases")
                    ? "bg-[#074c82] text-white"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Cases
              </Link>
              <Link
                href="/institutions"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  pathname.startsWith("/institutions")
                    ? "bg-[#074c82] text-white"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                Institutions
              </Link>
              <Link
                href="/overlaps"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  pathname === "/overlaps"
                    ? "bg-[#074c82] text-white"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <GitCompare className="h-3.5 w-3.5 text-amber-500" />
                Overlaps
              </Link>
              <Link
                href="/reports"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  pathname === "/reports"
                    ? "bg-[#074c82] text-white"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Reports
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/settings"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    pathname === "/settings"
                      ? "bg-[#074c82] text-white"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth / Action Button on right */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-3">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-tight">{user.name.split(" ")[0]}</span>
                  <RoleBadge role={user.role} />
                </div>
                <div className="text-[10px] text-slate-500">
                  {user.role === "REGIONAL_OFFICER" ? `Region: ${user.region || "RO"}` : user.department || "AICTE HQ"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out of Officer Portal"
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors shadow-2xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-[#074c82] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0c406d] transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Officer Login</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden shadow-lg">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              href="/submit-complaint"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Submit Complaint
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Track Complaint
            </Link>

            {user && (
              <>
                <div className="border-t border-slate-100 my-2 pt-2">
                  <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Officer Portal ({user.name})
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/cases"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cases
                </Link>
                <Link
                  href="/institutions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Institutions
                </Link>
                <Link
                  href="/overlaps"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Overlap Detection
                </Link>
                <Link
                  href="/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reports
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Settings & Audit
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left rounded-md px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            )}

            {!user && (
              <div className="border-t border-slate-100 pt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center rounded-lg bg-[#074c82] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                >
                  Officer Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

