"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Key,
  Shield,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Building2,
  UserCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed. Please check your credentials.");
      } else {
        // Redirect to officer dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to contact authentication server. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#074c82] text-white shadow-md">
          <Shield className="h-8 w-8 text-sky-200" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Authorized Officer Login
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          AICTE Grievance Monitoring & Case Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Official AICTE Email</label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@caselens.aicte.gov.in"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Security Password</label>
              <div className="relative mt-1.5">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
                />
                <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#074c82] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0c406d] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Seeded Demo Accounts Quick-Fill Section */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Demo Accounts Quick-Fill
              </span>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                Hackathon Demo
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Click an officer profile below to automatically populate test credentials:
            </p>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => fillDemoAccount("admin@caselens.aicte.gov.in", "Admin@CaseLens2026!")}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-left text-xs hover:border-[#074c82] hover:bg-sky-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">Dr. Alok Verma (Super Admin)</div>
                  <div className="text-[11px] text-slate-500">All permissions: cases, users, audit, settings</div>
                </div>
                <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                  ADMIN
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount("bureau.officer@caselens.aicte.gov.in", "Bureau@CaseLens2026!")}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-left text-xs hover:border-[#074c82] hover:bg-sky-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">Smt. Sunita Rao (Bureau Officer)</div>
                  <div className="text-[11px] text-slate-500">Approval Bureau: remarks, assignment, overlaps</div>
                </div>
                <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                  BUREAU
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount("ro.north@caselens.aicte.gov.in", "Regional@CaseLens2026!")}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-left text-xs hover:border-[#074c82] hover:bg-sky-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">Shri Rajesh Sharma (Regional Officer)</div>
                  <div className="text-[11px] text-slate-500">Strictly scoped: North Region cases only</div>
                </div>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  REGIONAL
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Are you a student looking to lodge a complaint? </span>
            <Link href="/submit-complaint" className="font-semibold text-[#074c82] hover:underline">
              Go to Student Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

