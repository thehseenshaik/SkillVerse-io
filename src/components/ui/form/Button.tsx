/**
 * Reusable Button Component
 * Consistent button with variants, sizes, and loading states
 */

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-gradient text-white shadow-glow hover:scale-[1.01] focus:ring-2 focus:ring-brand/20",
  secondary:
    "bg-background text-foreground border border-border hover:bg-secondary/60 hover:border-foreground/40",
  outline:
    "bg-transparent text-foreground border border-border hover:border-foreground/40 hover:bg-secondary/60",
  ghost: "bg-transparent text-foreground hover:bg-secondary/60",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-10 px-6 text-sm",
  lg: "h-11 px-8 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = "left",
      children,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-lg font-semibold
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && icon && iconPosition === "left" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
