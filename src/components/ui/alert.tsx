import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "neutral" | "success" | "warning" | "danger" | "info";

const variants: Record<AlertVariant, string> = {
  neutral: "border-border bg-card text-card-foreground",
  success: "border-success bg-success/10 text-foreground",
  warning: "border-warning bg-warning/10 text-foreground",
  danger: "border-danger bg-danger/10 text-foreground",
  info: "border-info bg-info/10 text-foreground",
};

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

export function Alert({ className, variant = "neutral", ...props }: AlertProps) {
  return (
    <div
      className={cn("rounded-md border p-4 text-sm leading-6", variants[variant], className)}
      role="status"
      {...props}
    />
  );
}
