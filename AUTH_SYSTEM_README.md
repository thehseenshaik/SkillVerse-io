# SkillVerse Authentication System Documentation

## Overview

This document provides comprehensive documentation for the SkillVerse authentication and user foundation system. The system is built with React, TypeScript, Tailwind CSS, Firebase Authentication, and Firestore, following clean, scalable, and secure coding practices.

## Table of Contents

- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Authentication Methods](#authentication-methods)
- [Components](#components)
- [Services](#services)
- [Validation](#validation)
- [Session Management](#session-management)
- [Security](#security)
- [Firestore Security Rules](#firestore-security-rules)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)
- [Testing](#testing)

## Architecture

The authentication system follows a modular architecture with clear separation of concerns:

```
src/
├── components/
│   ├── auth/              # Authentication UI components
│   ├── ui/
│   │   └── form/          # Reusable form components
│   └── ErrorBoundary.tsx  # Error handling
├── lib/
│   ├── auth-context.tsx   # Auth state management
│   ├── firebase.ts        # Firebase initialization
│   ├── validation/
│   │   └── auth.ts        # Zod validation schemas
│   └── session.ts         # Session management utilities
├── services/
│   └── auth.service.ts    # Authentication service layer
└── types/
    └── user.ts            # TypeScript type definitions
```

## File Structure

### Core Files

| File                           | Description                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `src/types/user.ts`            | Comprehensive TypeScript interfaces for user data, profile, settings, and more |
| `src/lib/validation/auth.ts`   | Zod validation schemas for all authentication forms                            |
| `src/services/auth.service.ts` | Service layer wrapping Firebase SDK with enhanced logic                        |
| `src/lib/auth-context.tsx`     | React context for auth state management                                        |
| `src/lib/session.ts`           | Session management utilities                                                   |
| `firestore.rules`              | Firestore security rules                                                       |

### Components

| Component               | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `SignUpForm.tsx`        | Comprehensive sign-up form with validation               |
| `EnhancedLoginForm.tsx` | Login form with remember me, forgot password, magic link |
| `EmailVerification.tsx` | Email verification flow with resend functionality        |
| `ForgotPassword.tsx`    | Password reset with rate limiting                        |
| `OnboardingWizard.tsx`  | Multi-step onboarding wizard                             |
| `AccountSettings.tsx`   | Account settings with profile, security, privacy tabs    |
| `WelcomeExperience.tsx` | Welcome screen after account creation                    |
| `ErrorBoundary.tsx`     | Error boundary component                                 |

## Authentication Methods

### 1. Email/Password

```typescript
import { signUp, signIn } from "@/services/auth.service";

// Sign up
await signUp({
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  email: "john@example.com",
  password: "SecurePass123!",
  confirmPassword: "SecurePass123!",
  country: "United States",
  acceptTerms: true,
  newsletter: false,
});

// Sign in
await signIn({
  email: "john@example.com",
  password: "SecurePass123!",
  rememberMe: true,
});
```

### 2. Google OAuth

```typescript
import { signInWithGoogle } from "@/services/auth.service";

await signInWithGoogle();
```

### 3. GitHub OAuth

```typescript
import { signInWithGithub } from "@/services/auth.service";

await signInWithGithub();
```

### 4. Magic Link (Passwordless)

```typescript
import { sendMagicLink } from "@/services/auth.service";

await sendMagicLink("john@example.com");
```

## Components

### SignUpForm

Features:

- Full name, username, email, password validation
- Country selection
- Terms acceptance
- Newsletter subscription
- Username availability check
- Password strength indicator
- OAuth buttons (Google, GitHub)

### EnhancedLoginForm

Features:

- Email/password login
- Remember me checkbox
- Forgot password link
- Magic link option
- OAuth buttons (Google, GitHub)
- Password visibility toggle

### EmailVerification

Features:

- Email verification status display
- Resend verification email
- Cooldown timer (60 seconds)
- Skip option
- Auto-redirect after verification

### ForgotPassword

Features:

- Rate limiting (3 attempts per 15 minutes)
- Multi-step flow (request → sent → reset → success)
- Password reset with validation
- Resend functionality

### OnboardingWizard

Features:

- Multi-step wizard (welcome, education, career, interests, domains, companies)
- Skip option for each step
- Interest/domain/company selection
- Progress tracking
- Auto-save on completion

### AccountSettings

Features:

- Profile update (name, bio, country, timezone)
- Password change
- Email change
- Notification preferences
- Privacy settings
- Danger zone (delete account, logout all devices, download data)

## Services

### Auth Service (`src/services/auth.service.ts`)

Available functions:

| Function                                       | Description                            |
| ---------------------------------------------- | -------------------------------------- |
| `signUp(formData)`                             | Create new user account                |
| `signIn(formData)`                             | Sign in with email/password            |
| `signInWithGoogle()`                           | Sign in with Google OAuth              |
| `signInWithGithub()`                           | Sign in with GitHub OAuth              |
| `sendMagicLink(email)`                         | Send magic link for passwordless login |
| `sendVerificationEmail()`                      | Send email verification                |
| `verifyEmail(code)`                            | Verify email with action code          |
| `sendPasswordReset(email)`                     | Send password reset email              |
| `verifyPasswordResetCode(code)`                | Verify reset code                      |
| `confirmPasswordReset(code, newPassword)`      | Reset password                         |
| `changePassword(currentPassword, newPassword)` | Change password                        |
| `changeEmail(newEmail, password)`              | Change email                           |
| `signOut()`                                    | Sign out user                          |
| `deleteAccount(password)`                      | Delete user account                    |
| `updateUserProfile(updates)`                   | Update user profile                    |
| `getUserDocument(userId)`                      | Get user document from Firestore       |
| `checkUsernameAvailability(username)`          | Check if username is available         |
| `reserveUsername(userId, username)`            | Reserve username for user              |

## Validation

### Validation Schemas (`src/lib/validation/auth.ts`)

| Schema                 | Fields                                             |
| ---------------------- | -------------------------------------------------- |
| `passwordSchema`       | Min 8 chars, uppercase, lowercase, number, special |
| `emailSchema`          | Valid email format                                 |
| `usernameSchema`       | 3-20 chars, alphanumeric, hyphens, underscores     |
| `nameSchema`           | 2-50 chars, letters, spaces, hyphens               |
| `signUpSchema`         | All sign-up fields with validation                 |
| `loginSchema`          | Email, password, remember me                       |
| `forgotPasswordSchema` | Email                                              |
| `resetPasswordSchema`  | Password, confirm password                         |
| `changePasswordSchema` | Current password, new password, confirm            |
| `updateEmailSchema`    | New email, current password                        |
| `magicLinkSchema`      | Email                                              |
| `onboardingSchema`     | Education, career, interests, domains, companies   |
| `profileUpdateSchema`  | Profile fields                                     |
| `settingsSchema`       | Settings fields                                    |

### Usage

```typescript
import {
  signUpSchema,
  validateField,
  validateForm,
} from "@/lib/validation/auth";

// Validate entire form
const result = signUpSchema.safeParse(formData);
if (!result.success) {
  console.log(result.error.errors);
}

// Validate single field
const fieldError = validateField("email", "invalid-email", emailSchema);
```

## Session Management

### Session Utilities (`src/lib/session.ts`)

| Function                        | Description                           |
| ------------------------------- | ------------------------------------- |
| `getCurrentSession()`           | Get current session from localStorage |
| `saveCurrentSession(session)`   | Save current session                  |
| `clearCurrentSession()`         | Clear current session                 |
| `getAllSessions()`              | Get all user sessions                 |
| `createSession(user)`           | Create new session                    |
| `updateSessionActivity()`       | Update last active time               |
| `deleteSession(sessionId)`      | Delete specific session               |
| `deleteOtherSessions(userId)`   | Delete all except current             |
| `deleteAllSessions(userId)`     | Delete all sessions                   |
| `isSessionExpired()`            | Check if session is expired           |
| `setupAutoLogout()`             | Setup auto logout on inactivity       |
| `setupRememberMe()`             | Setup remember me functionality       |
| `getSessionInfo()`              | Get session info for display          |
| `getAllSessionsInfo()`          | Get all sessions info                 |
| `initializeSessionManagement()` | Initialize all session features       |

### Auto Logout

Auto logout is enabled by default with a 30-minute inactivity timeout. This can be configured via environment variables.

```typescript
import { initializeSessionManagement } from "@/lib/session";

// Initialize in your app root
initializeSessionManagement();
```

## Security

### Features Implemented

1. **Rate Limiting**
   - Password reset: 3 attempts per 15 minutes
   - Stored in localStorage with timestamp tracking

2. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

3. **Session Management**
   - Auto logout on inactivity (30 minutes)
   - Remember me functionality
   - Multi-device session tracking
   - Session expiration handling

4. **Input Validation**
   - Zod schemas for all forms
   - Server-side validation (via Firebase)
   - XSS prevention through proper escaping

5. **Firestore Security Rules**
   - User data isolation
   - Role-based access control
   - Field-level permissions
   - Prevents unauthorized writes

### Best Practices

- Never expose Firebase Admin SDK on client
- Use Firebase SDK for client-side operations
- Implement server-side validation for sensitive operations
- Use HTTPS in production
- Enable email verification
- Implement proper error handling

## Firestore Security Rules

### Key Rules

1. **Users Collection**
   - Users can read/write their own data
   - Admins have full access
   - Role changes restricted to admins

2. **Usernames Collection**
   - Ensures username uniqueness
   - Users can reserve usernames
   - Admins can manage reservations

3. **Public Profiles**
   - Read access based on privacy settings
   - Users control their visibility

4. **Sessions**
   - Users can manage their own sessions
   - Admins can view all sessions

### Deployment

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules
```

## Environment Variables

### Required Variables

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Optional Variables

```bash
# Session Settings
VITE_SESSION_TIMEOUT=1800000
VITE_ENABLE_REMEMBER_ME=true
VITE_ENABLE_AUTO_LOGOUT=true

# Rate Limiting
VITE_RATE_LIMIT_MAX_ATTEMPTS=3
VITE_RATE_LIMIT_WINDOW=900000

# Feature Flags
VITE_ENABLE_ONBOARDING=true
VITE_ENABLE_COMMUNITY=false
VITE_ENABLE_AI_FEATURES=false
```

See `.env.example` for the complete list.

## Setup Instructions

### 1. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication:
   - Email/Password
   - Google
   - GitHub
3. Enable Firestore
4. Copy Firebase config to `src/lib/firebase.ts` or use environment variables

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 4. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 5. Run Development Server

```bash
npm run dev
```

## Testing

### Manual Testing Checklist

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with Google
- [ ] Sign in with GitHub
- [ ] Send magic link
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Onboarding wizard
- [ ] Profile update
- [ ] Password change
- [ ] Email change
- [ ] Account deletion
- [ ] Session management
- [ ] Auto logout
- [ ] Rate limiting

### Automated Testing

```bash
# Run tests (when implemented)
npm test
```

## Troubleshooting

### Common Issues

**Issue: "This domain isn't authorized in Firebase"**

- Solution: Add your domain to Firebase Auth → Settings → Authorized domains

**Issue: Email verification not sending**

- Solution: Check Firebase email templates are configured
- Solution: Verify email provider settings in Firebase Console

**Issue: Rate limiting not working**

- Solution: Check localStorage is enabled
- Solution: Verify rate limit environment variables

**Issue: Session not persisting**

- Solution: Check remember me is enabled
- Solution: Verify localStorage is not being cleared

## Future Enhancements

- [ ] Email OTP authentication
- [ ] LinkedIn OAuth
- [ ] Apple OAuth
- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication
- [ ] Social account linking
- [ ] Admin dashboard
- [ ] User analytics dashboard
- [ ] Advanced session management
- [ ] Email template customization

## Support

For issues or questions, please refer to the main project documentation or contact the development team.

---

**Last Updated:** 2024
**Version:** 1.0.0
