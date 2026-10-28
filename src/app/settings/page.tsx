"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Shield,
  UserPlus,
  History,
  Lock,
  RefreshCw,
  Check,
  AlertCircle,
  Database,
  Users,
} from "lucide-react";
import { RoleBadge } from "@/components/Badge";
import { formatDateTime } from "@/lib/utils";
import { AICTE_BUREAUS, AICTE_REGIONS } from "@/lib/constants";

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Officer Form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("BUREAU_OFFICER");
  const [newDepartment, setNewDepartment] = useState<string>(AICTE_BUREAUS[0]);
  const [newRegion, setNewRegion] = useState("North");
  const [creatingUser, setCreatingUser] = useState(false);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // 1. Verify admin role
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const meData = await meRes.json();
      if (meData.user?.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      setCurrentUser(meData.user);

      // 2. Fetch users
      const usersRes = await fetch("/api/users");
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
      }

      // 3. Fetch audit logs
      const auditRes = await fetch("/api/audit");
      if (auditRes.ok) {
        const aData = await auditRes.json();
        setAuditLogs(aData.auditLogs || []);
      }
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserSuccess(null);
    setUserError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          role: newRole,
          department: newDepartment,
          region: newRole === "REGIONAL_OFFICER" ? newRegion : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUserError(data.error || "Failed to create officer account.");
      } else {
        setUserSuccess(`Officer account created for ${data.user.name}.`);
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        fetchData();
      }
    } catch (err) {
      console.error("Create user error:", err);
      setUserError("Network error while creating account.");
    } finally {
      setCreatingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#074c82]" />
          <p className="mt-2 text-xs font-semibold text-slate-600">Verifying administrator clearance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            System Administration & Audit Controls
          </h1>
          <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
            Super Admin Only
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Manage officer roles, test accounts, application configurations, and inspect immutable system audit logs.
        </p>
      </div>

      {/* Grid: Officer User Management */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Add Officer Account Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[#074c82]" />
            Provision New Officer Account
          </h2>

          {userSuccess && (
            <div className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800">
              {userSuccess}
            </div>
          )}
          {userError && (
            <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-800">
              {userError}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700">Officer Full Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Dr. Sunita Deshmukh"
                className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-[#074c82]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Official AICTE Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="officer.name@caselens.aicte.gov.in"
                className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-[#074c82]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-[#074c82]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Assigned Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 focus:border-[#074c82]"
              >
                <option value="BUREAU_OFFICER">Bureau Officer</option>
                <option value="REGIONAL_OFFICER">Regional Officer</option>
                <option value="ADMIN">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700">AICTE Bureau / Cell</label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 focus:border-[#074c82]"
              >
                {AICTE_BUREAUS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {newRole === "REGIONAL_OFFICER" && (
              <div>
                <label className="block font-semibold text-slate-700">Geographic Jurisdiction</label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 focus:border-[#074c82]"
                >
                  <option value="North">North (Delhi / UP / Punjab / J&K)</option>
                  <option value="South">South (Karnataka / Kerala)</option>
                  <option value="West">West (Maharashtra / Gujarat / Goa)</option>
                  <option value="East">East (West Bengal / Bihar)</option>
                  <option value="Central">Central (Madhya Pradesh)</option>
                  <option value="North-West">North-West (Rajasthan)</option>
                  <option value="South-West">South-West (Tamil Nadu / AP / Telangana)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={creatingUser}
              className="mt-2 w-full rounded-lg bg-[#074c82] py-2 font-semibold text-white hover:bg-[#0c406d] transition-colors disabled:opacity-50"
            >
              {creatingUser ? "Creating..." : "Create Officer Account"}
            </button>
          </form>
        </div>

        {/* Existing Accounts Table (2 spans) */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-[#074c82]" />
                Registered Officer & Administrator Accounts
              </h2>
              <p className="text-xs text-slate-500">Authorized personnel credentials and assigned scopes</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{users.length} Active Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-5 py-3">Officer Name</th>
                  <th className="px-5 py-3">Email Address</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Bureau / Region</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-5 py-3 font-mono text-slate-700">{u.email}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {u.role === "REGIONAL_OFFICER" ? `Region: ${u.region || "RO"}` : u.department || "AICTE HQ"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Persistent System Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="h-4 w-4 text-[#074c82]" />
              Immutable System Audit Log
            </h2>
            <p className="text-xs text-slate-500">
              Chronological security record capturing who performed an action, what changed, IP address, and timestamp. Never logs passwords or sensitive credentials.
            </p>
          </div>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
            {auditLogs.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Actor & Role</th>
                <th className="px-5 py-3">Action Event</th>
                <th className="px-5 py-3">Entity Type</th>
                <th className="px-5 py-3">Audit Details</th>
                <th className="px-5 py-3">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-2.5 whitespace-nowrap text-slate-500">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-5 py-2.5 whitespace-nowrap text-slate-800 font-sans">
                    <strong>{log.user?.name || log.userEmail || "System"}</strong>
                    <span className="block text-[10px] text-slate-400 font-mono">[{log.userRole || "ANONYMOUS"}]</span>
                  </td>
                  <td className="px-5 py-2.5 whitespace-nowrap">
                    <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 whitespace-nowrap text-slate-600 font-sans">
                    {log.entityType}
                  </td>
                  <td className="px-5 py-2.5 max-w-md truncate text-slate-600">
                    {log.details}
                  </td>
                  <td className="px-5 py-2.5 whitespace-nowrap text-slate-400">
                    {log.ipAddress || "127.0.0.1"}
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

