import React from "react";
import Link from "next/link";
import { Shield, AlertCircle, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      {/* Official Prototype Disclaimer Banner */}
      <div className="border-b border-amber-200/60 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-900">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
          <span>
            <strong>Demonstration Prototype:</strong> This software is developed for the Smart India Hackathon internal evaluation. It is <em>not</em> an official AICTE production service unless formally integrated and approved by AICTE authorities. All seeded institutional records and complaints are fictional demo cases.
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#074c82] text-white">
                <Shield className="h-5 w-5 text-sky-200" />
              </div>
              <span className="text-lg font-bold text-[#074c82]">CaseLens</span>
              <span className="text-xs text-slate-500 font-medium">| AICTE Case Monitoring System</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              A centralized grievance oversight, algorithmic overlap detection, and multi-bureau resolution platform ensuring transparency, strict regional jurisdictional scoping, and institutional accountability.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Student Grievances</h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/submit-complaint" className="hover:text-[#074c82] hover:underline">
                  Submit Institutional Complaint
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#074c82] hover:underline">
                  Track Complaint by Case ID
                </Link>
              </li>
              <li>
                <a
                  href="https://www.aicte-india.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#074c82]"
                >
                  Official AICTE Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Officer Governance</h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/login" className="hover:text-[#074c82] hover:underline">
                  Authorized Officer Login
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Strict Role-Based Access Control</span>
              </li>
              <li>
                <span className="text-slate-400">Audit Trail & Compliance Logging</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 CaseLens. Smart India Hackathon Prototype Project.</p>
          <p className="mt-2 sm:mt-0">AICTE Approval Process Handbook (APH) Grievance Framework</p>
        </div>
      </div>
    </footer>
  );
}

