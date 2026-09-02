import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-24 w-full rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-fg placeholder:text-subtle",
          "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
          className,
        )}
        {...props}
      />
    );
  },
);
