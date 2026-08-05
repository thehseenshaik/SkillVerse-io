/**
 * Authentication Validation Utilities
 * Comprehensive validation for all authentication-related operations
 */

import { z } from "zod";

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

export const passwordStrength = (
  password: string,
): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
  ];

  return {
    score: Math.min(score, 5),
    label: labels[Math.min(score, 5)],
    color: colors[Math.min(score, 5)],
  };
};

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(254, "Email is too long")
  .regex(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Please enter a valid email address",
  );

// ============================================================================
// USERNAME VALIDATION
// ============================================================================

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores",
  )
  .regex(/^[a-zA-Z]/, "Username must start with a letter");

// ============================================================================
// NAME VALIDATION
// ============================================================================

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name must be less than 60 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes",
  );

export const firstNameSchema = nameSchema;
export const lastNameSchema = nameSchema;

// ============================================================================
// SIGN UP VALIDATION
// ============================================================================

export const signUpSchema = z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    country: z.string().min(2, "Please select a country"),
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions",
      ),
    newsletter: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

// ============================================================================
// LOGIN VALIDATION
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// FORGOT PASSWORD VALIDATION
// ============================================================================

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================================================
// RESET PASSWORD VALIDATION
// ============================================================================

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// CHANGE PASSWORD VALIDATION
// ============================================================================

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ============================================================================
// UPDATE EMAIL VALIDATION
// ============================================================================

export const updateEmailSchema = z
  .object({
    newEmail: emailSchema,
    password: z.string().min(1, "Password is required to change email"),
  })
  .refine((data) => data.newEmail !== data.password, {
    message: "New email cannot be the same as current email",
    path: ["newEmail"],
  });

export type UpdateEmailFormData = z.infer<typeof updateEmailSchema>;

// ============================================================================
// MAGIC LINK VALIDATION
// ============================================================================

export const magicLinkSchema = z.object({
  email: emailSchema,
});

export type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

// ============================================================================
// ONBOARDING VALIDATION
// ============================================================================

export const onboardingSchema = z.object({
  profilePhoto: z.string().optional(),
  college: z.string().min(2, "College name is required").optional(),
  degree: z.string().min(2, "Degree is required").optional(),
  branch: z.string().min(2, "Branch is required").optional(),
  graduationYear: z
    .string()
    .regex(/^\d{4}$/, "Invalid year format")
    .optional(),
  currentRole: z.string().min(2, "Current role is required").optional(),
  careerGoal: z.string().min(2, "Career goal is required").optional(),
  interests: z
    .array(z.string())
    .min(1, "Select at least one interest")
    .optional(),
  preferredDomains: z
    .array(z.string())
    .min(1, "Select at least one domain")
    .optional(),
  preferredCompanies: z.array(z.string()).optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// ============================================================================
// PROFILE UPDATE VALIDATION
// ============================================================================

export const profileUpdateSchema = z.object({
  firstName: firstNameSchema.optional(),
  lastName: lastNameSchema.optional(),
  username: usernameSchema.optional(),
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(60)
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  country: z.string().min(2, "Please select a country").optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  pronouns: z.string().optional(),
  location: z.string().optional(),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// ============================================================================
// SETTINGS VALIDATION
// ============================================================================

export const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    marketing: z.boolean(),
    security: z.boolean(),
    updates: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(["public", "private", "connections"]),
    showEmail: z.boolean(),
    showLocation: z.boolean(),
    allowMessages: z.boolean(),
  }),
  accessibility: z.object({
    fontSize: z.enum(["small", "medium", "large"]),
    reducedMotion: z.boolean(),
    highContrast: z.boolean(),
  }),
  language: z.string(),
  timezone: z.string(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// ============================================================================
// UTILITIES
// ============================================================================

export const validateField = (
  schema: z.ZodObject<any>,
  field: string,
  value: any,
): { valid: boolean; error?: string } => {
  try {
    const fieldSchema = schema.shape[field];
    if (!fieldSchema) {
      return { valid: true };
    }
    const result = fieldSchema.safeParse(value);
    if (result.success) {
      return { valid: true };
    }
    return {
      valid: false,
      error: result.error.issues[0]?.message || "Invalid value",
    };
  } catch {
    return { valid: true };
  }
};

export const validateForm = (
  schema: z.ZodSchema<any>,
  data: any,
): { valid: boolean; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: {} };
  }
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue: z.ZodIssue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });
  return { valid: false, errors };
};
