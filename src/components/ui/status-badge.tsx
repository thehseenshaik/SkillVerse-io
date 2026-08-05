import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
  {
    variants: {
      variant: {
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        error: "bg-red-500/10 text-red-600 dark:text-red-400",
        info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        neutral: "bg-secondary text-muted-foreground",
        brand: "bg-brand/10 text-brand",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-[11px]",
        lg: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  },
);

export interface StatusBadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  dot?: boolean;
}

export function StatusBadge({
  className,
  variant,
  size,
  dot = false,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "error" && "bg-red-500",
            variant === "info" && "bg-blue-500",
            variant === "brand" && "bg-brand",
            variant === "neutral" && "bg-muted-foreground",
          )}
        />
      )}
      {children}
    </span>
  );
}
