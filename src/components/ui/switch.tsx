"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "role"> & {
  checked?: boolean;
};

export function Switch({ checked = false, className, ...props }: SwitchProps) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        "inline-flex h-6 w-11 items-center rounded-full border border-transparent bg-muted p-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[checked=true]:bg-primary",
        className
      )}
      data-checked={checked}
      role="switch"
      type="button"
      {...props}
    >
      <span
        className={cn(
          "size-4 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
