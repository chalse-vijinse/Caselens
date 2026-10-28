"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Building2,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  Search,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { COMPLAINT_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface InstitutionItem {
  id: string;
  name: string;
  aictePid: string;
  region: string;
  state: string;
  city: string;
}

export default function SubmitComplaintPage() {
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // Form State
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [aictePid, setAictePid] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedCase, setSubmittedCase] = useState<{
    caseId: string;
    createdAt: string;
    status: string;
    institutionName: string;
    category: string;
  } | null>(null);

  // Fetch institutions for dropdown
  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const res = await fetch("/api/institutions");
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data.institutions || []);
        }
      } catch (err) {
        console.error("Failed to load institutions:", err);
      } finally {
        setLoadingInstitutions(false);
      }
    }
    fetchInstitutions();
  }, []);

  // When user selects an institution, auto-fill its AICTE PID
  const handleInstitutionChange = (id: string) => {
    setInstitutionId(id);
    const found = institutions.find((i) => i.id === id);
    if (found) {
      setAictePid(found.aictePid);
    } else {
      setAictePid("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (!studentName.trim() || studentName.trim().length < 2) {
      setErrorMessage("Please enter your full legal name (minimum 2 characters).");
      return;
    }
    if (!studentEmail.trim() || !/^\S+@\S+\.\S+$/.test(studentEmail)) {
      setErrorMessage("Please enter a valid email address so you can track your complaint status.");
      return;
    }
    if (!institutionId) {
      setErrorMessage("Please select the AICTE-approved institution against which the complaint is being lodged.");
      return;
    }
    if (!category) {
      setErrorMessage("Please select a grievance classification category.");
      return;
    }
    if (!subject.trim() || subject.trim().length < 5) {
      setErrorMessage("Please enter a descriptive grievance subject (minimum 5 characters).");
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      setErrorMessage("Please provide a detailed description of the incident/deficiency (minimum 20 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim(),
          studentPhone: studentPhone.trim() || null,
          institutionId,
          aictePid: aictePid.trim() || null,
          category,
          subject: subject.trim(),
          description: description.trim(),
          referenceNumber: referenceNumber.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to submit grievance. Please verify all fields and retry.");
        setIsSubmitting(false);
        return;
      }

      // Success
      setSubmittedCase(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage("A network error occurred while connecting to the grievance server. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedCase(null);
    setStudentName("");
    setStudentEmail("");
    setStudentPhone("");
    setInstitutionId("");
    setAictePid("");
    setCategory("");
    setSubject("");
    setDescription("");
    setReferenceNumber("");
    setErrorMessage(null);
  };

  // SUCCESS VIEW: Shown immediately after complaint submission
  if (submittedCase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-10 w-10" />
          </div>

          <span className="mt-4 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            Complaint Registered Successfully
          </span>

          <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
            Grievance Case Generated
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Your complaint has been encrypted and recorded in the AICTE Integrated Database. Please preserve your Case ID for tracking inquiries.
          </p>

          {/* Case Identification Box */}
          <div className="mt-6 rounded-xl border-2 border-dashed border-[#074c82] bg-sky-50/50 p-6 text-center max-w-lg mx-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Official Case ID</p>
            <div className="mt-2 text-2xl sm:text-3xl font-mono font-black text-[#074c82] tracking-wider select-all">
              {submittedCase.caseId}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-left border-t border-sky-200/60 pt-3 text-xs">
              <div>
                <span className="text-slate-500">Submission Date:</span>
                <p className="font-semibold text-slate-800">{formatDate(submittedCase.createdAt)}</p>
              </div>
              <div>
                <span className="text-slate-500">Initial Status:</span>
                <p className="font-semibold text-blue-700">SUBMITTED</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Institution:</span>
                <p className="font-semibold text-slate-800 truncate">{submittedCase.institutionName}</p>
              </div>
            </div>
          </div>

          {/* Instructions note */}
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-600 text-left border border-slate-200 max-w-lg mx-auto">
            <p className="font-semibold text-slate-800">What happens next?</p>
            <p className="mt-1">
              Your grievance will undergo initial scrutiny by the relevant AICTE Bureau within 3 working days. An investigating officer will be assigned, and you can monitor case status updates transparently using the Track Complaint page.
            </p>
          </div>

          {/* Action buttons - Note: NO officer dashboard links! */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/track?caseId=${submittedCase.caseId}&email=${encodeURIComponent(studentEmail)}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#074c82] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0c406d] transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Track Complaint Status</span>
            </Link>
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Submit Another Complaint</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD FORM VIEW
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#074c82] uppercase tracking-wider">
          <Shield className="h-4 w-4" />
          <span>AICTE Public Grievance Redressal Mechanism</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Lodge an Institutional Grievance
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          This portal allows students, parents, and stakeholders to register complaints against technical institutions under AICTE regulations. All submissions receive an official Case ID.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
          <div>
            <span className="font-bold">Form Submission Notice:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Complaint Submission Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Section 1: Student Particulars */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
              1
            </span>
            Complainant Information
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Contact information is required for case tracking and two-factor status verification.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Student / Complainant Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Registered Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student.email@example.com"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Tracking status requires matching this registered email.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Contact Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Prior Grievance / Ref Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. COLLEGE-GR-2026/891"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
              />
              <p className="mt-1 text-[11px] text-slate-500">Internal college ticket number if previously filed.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Institution & Category */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
              2
            </span>
            Target Institution & Grievance Domain
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Select AICTE Institution <span className="text-rose-500">*</span>
              </label>
              {loadingInstitutions ? (
                <div className="mt-1.5 text-xs text-slate-500">Loading institutions directory...</div>
              ) : (
                <select
                  required
                  value={institutionId}
                  onChange={(e) => handleInstitutionChange(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
                >
                  <option value="">-- Choose an institution from directory --</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.city}, {inst.state} — PID: {inst.aictePid})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                AICTE Permanent ID (PID)
              </label>
              <input
                type="text"
                readOnly
                value={aictePid}
                placeholder="Auto-populated upon selecting institution"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Grievance Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
              >
                <option value="">-- Choose category --</option>
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Grievance Narrative */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
              3
            </span>
            Grievance Particulars
          </h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Subject Line <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Demand for Rs 65,000 unapproved development fee under threat of exam debarment"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Detailed Statement of Grievance <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe facts, chronological events, affected departments/batches, amounts demanded or denied, names of staff approached, and exact relief sought..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#074c82] focus:outline-hidden focus:ring-1 focus:ring-[#074c82]"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Minimum 20 characters required. Be objective and factual.</span>
                <span>{description.length} characters</span>
              </div>
            </div>

            {/* Note on File Uploads */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-sky-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Notice on File Attachments:</strong> In compliance with security standards, file attachment uploads are not active in this demonstration prototype. If evidentiary documents are requested, the assigned investigating bureau officer will contact you directly via your registered email.
              </div>
            </div>
          </div>
        </div>

        {/* Declaration & Submit Button */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 max-w-md">
            By clicking Submit Grievance, you certify that the information submitted is true to the best of your knowledge and subject to AICTE regulations.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#074c82] px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0c406d] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Registering Complaint...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Submit Grievance</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

