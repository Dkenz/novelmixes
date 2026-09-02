import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-elevated px-4 text-sm text-fg placeholder:text-subtle",
          "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
          className,
        )}
        {...props}
      />
    );
  },
);
