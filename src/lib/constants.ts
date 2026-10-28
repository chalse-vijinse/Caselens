export const COMPLAINT_CATEGORIES = [
  "Excessive Fee / Capitation Fee",
  "Ragging & Student Harassment",
  "Faculty Shortage & Non-Payment of Salaries",
  "Infrastructure & Laboratory Deficiencies",
  "Withholding of Original Certificates / Degrees",
  "Admission Irregularities / Non-Refund of Fees",
  "Curriculum & Examination Irregularities",
  "Discriminatory Practices / Gender Bias",
  "Hostel & Mess Sanitation / Safety Deficiencies",
  "Fake / Unapproved Courses & Misleading Advertisements",
] as const;

export const CASE_STATUSES = [
  { value: "SUBMITTED", label: "Submitted", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "UNDER_REVIEW", label: "Under Review", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "ASSIGNED", label: "Assigned", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  { value: "RESOLVED", label: "Resolved", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "CLOSED", label: "Closed", color: "bg-slate-100 text-slate-700 border-slate-300" },
] as const;

export const CASE_PRIORITIES = [
  { value: "LOW", label: "Low", color: "bg-slate-100 text-slate-700 border-slate-300" },
  { value: "MEDIUM", label: "Medium", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "HIGH", label: "High", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "CRITICAL", label: "Critical", color: "bg-rose-100 text-rose-800 border-rose-300 animate-pulse" },
] as const;

export const AICTE_BUREAUS = [
  "Approval Bureau",
  "Policy & Academic Planning Bureau",
  "Student Welfare & Grievance Cell",
  "Finance & Regulatory Bureau",
  "Institutional Vigilance Cell",
  "Research & Faculty Development Bureau",
] as const;

export const AICTE_REGIONS = [
  "North (Delhi / UP / Haryana / Punjab / HP / J&K)",
  "South (Karnataka / Kerala / Lakshadweep)",
  "East (West Bengal / Bihar / Jharkhand / Odisha)",
  "West (Maharashtra / Goa / Gujarat)",
  "Central (Madhya Pradesh / Chhattisgarh)",
  "North-West (Rajasthan / Chandigarh)",
  "South-West (Tamil Nadu / Andhra Pradesh / Telangana / Puducherry)",
] as const;

export const USER_ROLES = {
  ADMIN: "ADMIN",
  BUREAU_OFFICER: "BUREAU_OFFICER",
  REGIONAL_OFFICER: "REGIONAL_OFFICER",
} as const;

