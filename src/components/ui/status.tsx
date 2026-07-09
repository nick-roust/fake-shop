import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const indicatorTones: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

const labelTones: Record<StatusTone, string> = {
  neutral: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

type StatusProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
};

export function StatusIndicator({ className, tone = "neutral", ...props }: StatusProps) {
  return (
    <span
      className={cn("inline-flex size-2 rounded-full", indicatorTones[tone], className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function StatusLabel({ className, tone = "neutral", ...props }: StatusProps) {
  return <span className={cn("text-sm font-medium", labelTones[tone], className)} {...props} />;
}

export function StatusBadge({ children, className, tone = "neutral", ...props }: StatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium",
        className
      )}
      {...props}
    >
      <StatusIndicator tone={tone} />
      {children}
    </span>
  );
}
