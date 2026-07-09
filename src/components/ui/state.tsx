import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StateProps = HTMLAttributes<HTMLDivElement> & {
  action?: ReactNode;
  description?: string;
  title: string;
};

export function EmptyState({ action, className, description, title, ...props }: StateProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border bg-card p-6 text-center",
        className
      )}
      {...props}
    >
      <h2 className="text-base font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ className, title = "Loading", ...props }: Partial<StateProps>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-card p-4",
        className
      )}
      {...props}
    >
      <span className="size-3 animate-pulse rounded-full bg-primary" />
      <span className="text-sm text-muted-foreground">{title}</span>
    </div>
  );
}

export function ErrorState({
  action = <Button variant="secondary">Retry</Button>,
  className,
  description,
  title,
  ...props
}: StateProps) {
  return (
    <div className={cn("rounded-md border border-danger bg-danger/10 p-5", className)} {...props}>
      <h2 className="text-base font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
