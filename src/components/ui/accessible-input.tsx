import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface AccessibleInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const AccessibleInput = forwardRef<
  HTMLInputElement,
  AccessibleInputProps
>(({ label, error, helperText, required, id, className, ...props }, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={inputId} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
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
});

AccessibleInput.displayName = "AccessibleInput";
