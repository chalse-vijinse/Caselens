import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ children, variant = "default", className, size = "md" }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-300",
    success: "bg-emerald-100 text-emerald-800 border-emerald-300",
    warning: "bg-amber-100 text-amber-800 border-amber-300",
    danger: "bg-rose-100 text-rose-800 border-rose-300",
    info: "bg-sky-100 text-sky-800 border-sky-300",
    purple: "bg-purple-100 text-purple-800 border-purple-300",
    outline: "bg-white text-slate-700 border-slate-300",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "SUBMITTED":
      return <Badge variant="info">Submitted</Badge>;
    case "UNDER_REVIEW":
      return <Badge variant="warning">Under Review</Badge>;
    case "ASSIGNED":
      return <Badge variant="purple">Assigned</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="info" className="bg-indigo-100 text-indigo-800 border-indigo-300">In Progress</Badge>;
    case "RESOLVED":
      return <Badge variant="success">Resolved</Badge>;
    case "CLOSED":
      return <Badge variant="default">Closed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "CRITICAL":
      return <Badge variant="danger" className="animate-pulse">Critical</Badge>;
    case "HIGH":
      return <Badge variant="warning">High</Badge>;
    case "MEDIUM":
      return <Badge variant="info">Medium</Badge>;
    case "LOW":
      return <Badge variant="default">Low</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
}

export function ConfidenceBadge({ level }: { level: string }) {
  switch (level) {
    case "HIGH_CONFIDENCE":
      return <Badge variant="danger" className="font-semibold">High Confidence Match</Badge>;
    case "POTENTIAL_MATCH":
      return <Badge variant="warning">Potential Match</Badge>;
    case "NEEDS_REVIEW":
      return <Badge variant="info">Needs Review</Badge>;
    default:
      return <Badge>{level}</Badge>;
  }
}

export function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "ADMIN":
      return <Badge variant="purple" className="font-semibold">Super Admin</Badge>;
    case "BUREAU_OFFICER":
      return <Badge variant="info">Bureau Officer</Badge>;
    case "REGIONAL_OFFICER":
      return <Badge variant="default" className="bg-amber-50 text-amber-900 border-amber-300">Regional Officer</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
}

