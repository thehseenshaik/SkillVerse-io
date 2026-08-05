/**
 * Custom Email Service for Firebase Authentication
 * This allows you to send custom emails using your own email service
 * while still using Firebase for authentication
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin
try {
  const serviceAccount = require("./service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "skillverse-13b58",
  });
} catch (error) {
  console.log("Service account not found. To use custom email service:");
  console.log("1. Download service account from Firebase Console");
  console.log("2. Save as service-account.json in project root");
  console.log("3. Re-run this script");
  process.exit(1);
}

const auth = admin.auth();

/**
 * Generate email verification link with custom email handling
 */
async function sendCustomEmailVerification(email) {
  try {
    const actionCodeSettings = {
      url: "http://localhost:5178/auth-callback", // Your app's callback URL
      handleCodeInApp: true,
    };

    const link = await auth.generateEmailVerificationLink(
      email,
      actionCodeSettings,
    );

    // Read your custom email template
    const emailTemplate = fs.readFileSync(
      path.join(__dirname, "firebase-email-template.html"),
      "utf8",
    );

    // Replace variables in template
    const customEmail = emailTemplate
      .replace("{{email}}", email)
      .replace("{{actionLink}}", link);

    console.log("Custom email verification link generated:", link);
    console.log("Custom email template ready with your premium design");

    // Here you would use your email service (SendGrid, Mailgun, etc.)
    // to send the customEmail HTML to the user

    return link;
  } catch (error) {
    console.error("Error generating email verification link:", error);
  }
}

/**
 * Generate password reset link with custom email handling
 */
async function sendCustomPasswordReset(email) {
  try {
    const actionCodeSettings = {
      url: "http://localhost:5178/change-password",
      handleCodeInApp: true,
    };

    const link = await auth.generatePasswordResetLink(
      email,
      actionCodeSettings,
    );

    const emailTemplate = fs.readFileSync(
      path.join(__dirname, "firebase-email-template.html"),
      "utf8",
    );

    const customEmail = emailTemplate
      .replace("{{email}}", email)
      .replace("{{actionLink}}", link);

    console.log("Custom password reset link generated:", link);
    console.log("Custom email template ready with your premium design");

    return link;
  } catch (error) {
    console.error("Error generating password reset link:", error);
  }
}

/**
 * Generate sign-in with email link (magic link) with custom email
 */
async function sendCustomSignInLink(email) {
  try {
    const actionCodeSettings = {
      url: "http://localhost:5178/auth-callback",
      handleCodeInApp: true,
    };

    const link = await auth.generateSignInWithEmailLink(
      email,
      actionCodeSettings,
    );

    const emailTemplate = fs.readFileSync(
      path.join(__dirname, "firebase-email-template.html"),
      "utf8",
    );

    const customEmail = emailTemplate
      .replace("{{email}}", email)
      .replace("{{actionLink}}", link);

    console.log("Custom sign-in link generated:", link);
    console.log("Custom email template ready with your premium design");

    return link;
  } catch (error) {
    console.error("Error generating sign-in link:", error);
  }
}

// Example usage
console.log("Custom Email Service for Firebase Authentication");
console.log(
  "This script allows you to send custom emails using your premium template",
);
console.log("\nTo use this service:");
console.log("1. Set up an email service (SendGrid, Mailgun, AWS SES, etc.)");
console.log("2. Integrate this script with your backend");
console.log("3. Replace Firebase default emails with custom emails");
console.log(
  "\nFor more info: https://firebase.google.com/docs/auth/admin/email-action-links",
);
