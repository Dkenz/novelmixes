import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-transform duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
  {
    variants: {
      variant: {
        primary: "nm-gradient text-fg shadow-[0_10px_30px_-12px] shadow-violet rounded-full",
        secondary: "bg-surface text-fg border border-border rounded-full hover:bg-panel",
        ghost: "bg-transparent text-fg hover:bg-fg/10 rounded-full",
        live: "bg-live text-fg rounded-full font-semibold",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
>(function Button({ className, variant, size, type = "button", ...props }, ref) {
  return (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
});
