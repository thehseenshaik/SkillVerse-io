# Firebase Email Template Setup Guide

## Overview

This guide shows you how to customize Firebase Authentication email templates to match SkillVerse's premium branding.

## Email Template Options

### Option 1: Firebase Console (Recommended for Magic Links)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `skillverse-13b58`
3. Navigate to: **Authentication** → **Templates** → **Email verification** or **Password reset**
4. Click "Customize" on the email template
5. Paste the HTML from `firebase-email-template.html`
6. Replace the Firebase variables:
   - `{{email}}` - User's email address
   - `{{actionLink}}` - The verification/reset link
   - `{{date}}` - Timestamp (if needed)

### Option 2: Firebase CLI (Advanced)

For programmatic management of email templates:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy email templates
firebase deploy --only auth:templates
```

## Template Variables

Firebase provides these variables you can use in your templates:

- `{{email}}` - User's email address
- `{{displayName}}` - User's display name (if available)
- `{{actionLink}}` - The action link (verify email, reset password, etc.)
- `{{newPassword}}` - For password reset emails (auto-generated passwords)
- `{{appName}}` - Your app name
- `{{url}}` - Your app's URL

## Customization Notes

### Logo

Replace the logo URL in the template:

```html
<img
  src="https://skillverse.io/logo.png"
  alt="SkillVerse Logo"
  width="160"
  height="auto"
/>
```

### Color Scheme

The template uses SkillVerse's brand colors:

- Primary: `#e84d0f` (ember orange)
- Secondary: `#d45a1a` (darker orange)
- Background: `#f5f5f0` (warm paper)
- Text: `#1a1a1a` (ink foreground)

### Email Types to Customize

1. **Email Verification** - For new user sign-ups
2. **Password Reset** - For forgotten passwords
3. **Email Change** - When users update their email
4. **Magic Link** - For passwordless sign-in

## Testing Your Templates

1. Use Firebase Console's "Send test email" feature
2. Test on multiple email clients (Gmail, Outlook, Apple Mail)
3. Test on mobile devices
4. Check spam folder behavior

## Additional Email Templates

The repository includes:

- `firebase-email-template.html` - Premium HTML template
- Additional templates can be created for different email types

## Support

For Firebase email template issues:

- [Firebase Email Templates Documentation](https://firebase.google.com/docs/auth/custom-email-templates)
- [Firebase Support](https://firebase.google.com/support/)
