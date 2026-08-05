/**
 * Reusable Form Input Component
 * Consistent input field with validation states and styling
 */

import { forwardRef, type InputHTMLAttributes, useMemo } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  helperText?: string;
  fullWidth?: boolean;
}

// Counter for generating unique IDs
let inputCounter = 0;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      iconPosition = "left",
      helperText,
      fullWidth = true,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = useMemo(() => {
      if (id) return id;
      const counter = ++inputCounter;
      return `input-${counter}`;
    }, [id]);
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`space-y-1.5 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-foreground"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div
          className={`relative flex h-10 items-center gap-2 rounded-lg border bg-background px-3 transition-colors focus-within:border-foreground focus-within:ring-2 focus-within:ring-brand/20 ${
            error ? "border-destructive" : "border-border"
          } ${className}`}
        >
          {icon && iconPosition === "left" && (
            <span className="text-muted-foreground flex-shrink-0">{icon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
            {...props}
          />
          {icon && iconPosition === "right" && (
            <span className="text-muted-foreground flex-shrink-0">{icon}</span>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
