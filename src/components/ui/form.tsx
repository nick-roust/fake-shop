import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldProps = HTMLAttributes<HTMLDivElement>;
type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Field({ className, ...props }: FieldProps) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function FieldLabel({ className, ...props }: LabelProps) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}

export function FieldDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs leading-5 text-muted-foreground", className)} {...props} />;
}

export function FieldError({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;

  return (
    <p className={cn("text-xs leading-5 text-danger", className)} role="alert" {...props}>
      {children}
    </p>
  );
}

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="grid gap-4">{children}</div>;
}
