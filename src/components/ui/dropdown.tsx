import type { DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DropdownProps = DetailsHTMLAttributes<HTMLDetailsElement> & {
  label: ReactNode;
};

export function Dropdown({ children, className, label, ...props }: DropdownProps) {
  return (
    <details className={cn("relative inline-block", className)} {...props}>
      <summary className="inline-flex h-10 cursor-pointer list-none items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {label}
      </summary>
      <div className="absolute right-0 z-10 mt-2 min-w-48 rounded-md border border-border bg-card p-1 shadow-lg">
        {children}
      </div>
    </details>
  );
}

export function DropdownItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-sm px-3 py-2 text-sm hover:bg-muted", className)} {...props} />
  );
}
