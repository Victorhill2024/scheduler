import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import type { PostStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: PostStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_COLORS[status],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "draft" && "bg-gray-500",
          status === "scheduled" && "bg-blue-600",
          status === "publishing" && "bg-amber-500 animate-pulse",
          status === "published" && "bg-emerald-600",
          status === "failed" && "bg-red-600",
        )}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
