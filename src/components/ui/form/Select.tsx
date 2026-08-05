/**
 * Reusable Select Component
 * Consistent select dropdown with validation states
 */

import { forwardRef, type SelectHTMLAttributes, useMemo } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

// Counter for generating unique IDs
let selectCounter = 0;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      options,
      placeholder = "Select...",
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = useMemo(() => {
      if (id) return id;
      const counter = ++selectCounter;
      return `select-${counter}`;
    }, [id]);
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className={`space-y-1.5 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-foreground"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`
              h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-10
              text-sm text-foreground outline-none transition-colors
              focus:border-foreground focus:ring-2 focus:ring-brand/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? "border-destructive" : "border-border"}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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

Select.displayName = "Select";
