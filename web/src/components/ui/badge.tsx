import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-fg/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-fg",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function LiveBadge({ className }: { className?: string }) {
  return (
    <Badge className={cn("bg-live text-fg", className)}>
      <span className="nm-live-dot size-1.5 rounded-full bg-fg" />
      Live
    </Badge>
  );
}
