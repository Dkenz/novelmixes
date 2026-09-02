import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const mark = size === "lg" ? "text-5xl" : size === "sm" ? "text-xl" : "text-3xl";
  return (
    <div className={cn("flex flex-col items-start leading-none", className)}>
      <span className={cn("nm-wordmark font-bold tracking-tight", mark)}>NM</span>
      {showWordmark ? (
        <span
          className={cn(
            "mt-1 font-medium uppercase tracking-[0.32em] text-muted",
            size === "lg" ? "text-[11px]" : "text-[9px]",
          )}
        >
          Novel Mixes
        </span>
      ) : null}
    </div>
  );
}
