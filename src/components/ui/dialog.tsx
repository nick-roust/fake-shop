"use client";

import type { DialogHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DialogProps = DialogHTMLAttributes<HTMLDialogElement> & {
  open: boolean;
  title: string;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
};

export function Dialog({
  children,
  className,
  onOpenChange,
  open,
  title,
  trigger,
  ...props
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      {trigger}
      <dialog
        aria-label={title}
        className={cn(
          "w-[min(92vw,32rem)] rounded-md border border-border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-foreground/40",
          className
        )}
        onClose={() => onOpenChange?.(false)}
        ref={dialogRef}
        {...props}
      >
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="p-5">{children}</div>
        <div className="border-t border-border p-5">
          <Button onClick={() => onOpenChange?.(false)} variant="secondary">
            Close
          </Button>
        </div>
      </dialog>
    </>
  );
}
