import type { ServiceStatus } from "@infraena/shared-types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ServiceStatus;
}

const styles: Record<ServiceStatus, string> = {
  provisioning: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  failed: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  imported: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
};

const labels: Record<ServiceStatus, string> = {
  provisioning: "Provisioning",
  ready: "Ready",
  failed: "Failed",
  imported: "Imported",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[status]
      )}
    >
      {status === "provisioning" && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      )}
      {status === "ready" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      )}
      {status === "failed" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      )}
      {status === "imported" && (
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
      )}
      {labels[status]}
    </span>
  );
}
