const express = require('express');
const router = express.Router();
const {
  getBaseEmailLayout,
  generateForgotPasswordEmail,
  generateLoginDetectedEmail,
  generatePasswordChangedEmail,
  generateDailyReportEmail,
} = require('../templates/email-templates');

let Resend;
try {
  const resendPkg = require('resend');
  Resend = resendPkg.Resend || resendPkg;
} catch (e) {
  console.warn('⚠️ resend package failed to load:', e.message);
}

// Initialize Resend Client
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !Resend) {
    if (!Resend) console.warn('⚠️ resend module not available.');
    if (!apiKey) console.warn('⚠️ RESEND_API_KEY is not set in environment.');
    return null;
  }
  return new Resend(apiKey);
};

const getFromEmail = () => process.env.RESEND_FROM_EMAIL || 'SkillVerse <onboarding@resend.dev>';

/**
 * 1. POST /api/email/welcome
 * Welcome Email
 */
router.post('/welcome', async (req, res) => {
  const { email, name, username } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const resend = getResendClient();
  if (!resend) return res.status(500).json({ error: 'Resend is not configured on this server.' });

  const displayName = name || (username ? `@${username}` : 'Developer');
  const htmlContent = getBaseEmailLayout({
    eyebrowText: "ACCOUNT WELCOME",
    titleHtml: 'Welcome to <span style="color: #f2634f;">SkillVerse.</span>',
    description: "Your career identity starts here. Build your professional profile, connect your skills, track your progress, and turn your work into opportunities.",
    cardHeading: "You're officially part of SkillVerse.",
    cardText: `Welcome to the community, ${displayName}! Your career command center is ready. Connect your coding profiles, calculate your live career score, and start building your developer identity.`,
    stepsLabel: "Your next steps",
    steps: [
      {
        title: "Complete your profile",
        description: "Add your education, skills, projects and career information to create your complete professional identity.",
      },
      {
        title: "Connect your platforms",
        description: "Sync platforms such as GitHub, LeetCode and GeeksforGeeks to bring your real progress into SkillVerse.",
      },
      {
        title: "Build your career profile",
        description: "Generate resumes, monitor your progress, practice for interviews and discover your next career move.",
      }
    ],
    ctaText: "Get started",
    ctaUrl: "https://skillverse-io.web.app/dashboard",
    secondaryText: "View SkillVerse",
    secondaryUrl: "https://skillverse-io.web.app/connections",
  });

  try {
    const result = await resend.emails.send({
      from: getFromEmail(),
      to: [email],
      subject: `Welcome to SkillVerse, ${name || username || 'Developer'}! 🚀`,
      html: htmlContent,
    });
    console.log(`✓ Welcome email sent to ${email}:`, result);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({ error: error.message || 'Failed to send welcome email' });
  }
});

/**
 * 2. POST /api/email/forgot-password
 * Forgot Password / Password Reset Link
 */
router.post('/forgot-password', async (req, res) => {
  const { email, resetUrl, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const resend = getResendClient();
  if (!resend) return res.status(500).json({ error: 'Resend is not configured on this server.' });

  const htmlContent = generateForgotPasswordEmail({
    email,
    name,
    resetUrl: resetUrl || `https://skillverse-io.web.app/forgot-password`,
  });

  try {
    const result = await resend.emails.send({
      from: getFromEmail(),
      to: [email],
      subject: 'Reset Your SkillVerse Password 🔒',
      html: htmlContent,
    });
    console.log(`✓ Password reset email sent to ${email}:`, result);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return res.status(500).json({ error: error.message || 'Failed to send password reset email' });
  }
});

/**
 * 3. POST /api/email/login-detected
 * Security alert for new login detected
 */
router.post('/login-detected', async (req, res) => {
  const { email, name, ipAddress, browser, location } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const resend = getResendClient();
  if (!resend) return res.status(500).json({ error: 'Resend is not configured on this server.' });

  const htmlContent = generateLoginDetectedEmail({
    email,
    name,
    ipAddress: ipAddress || req.ip || '127.0.0.1',
    browser: browser || req.headers['user-agent'] || 'Web Browser',
    location: location || 'Detected Location',
    time: new Date().toUTCString(),
  });

  try {
    const result = await resend.emails.send({
      from: getFromEmail(),
      to: [email],
      subject: 'Security Alert: New Login to SkillVerse 🛡️',
      html: htmlContent,
    });
    console.log(`✓ Login alert email sent to ${email}:`, result);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending login alert email:', error);
    return res.status(500).json({ error: error.message || 'Failed to send login alert' });
  }
});

/**
 * 4. POST /api/email/password-changed
 * Password changed confirmation
 */
router.post('/password-changed', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const resend = getResendClient();
  if (!resend) return res.status(500).json({ error: 'Resend is not configured on this server.' });

  const htmlContent = generatePasswordChangedEmail({
    email,
    name,
    time: new Date().toUTCString(),
  });

  try {
    const result = await resend.emails.send({
      from: getFromEmail(),
      to: [email],
      subject: 'Your SkillVerse Password Was Changed ✅',
      html: htmlContent,
    });
    console.log(`✓ Password changed confirmation sent to ${email}:`, result);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending password change confirmation:', error);
    return res.status(500).json({ error: error.message || 'Failed to send confirmation email' });
  }
});

/**
 * 5. POST /api/email/daily-report
 * Daily Career Report & Growth Digest
 */
router.post('/daily-report', async (req, res) => {
  const { email, name, careerScore, streakDays, solvedCount, topSkill, recommendedProblem } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const resend = getResendClient();
  if (!resend) return res.status(500).json({ error: 'Resend is not configured on this server.' });

  const htmlContent = generateDailyReportEmail({
    email,
    name,
    careerScore: careerScore || 84,
    streakDays: streakDays || 5,
    solvedCount: solvedCount || 42,
    topSkill: topSkill || 'Data Structures & Algorithms',
    recommendedProblem: recommendedProblem || 'Valid Parentheses (LeetCode #20)',
  });

  try {
    const result = await resend.emails.send({
      from: getFromEmail(),
      to: [email],
      subject: `Your SkillVerse Daily Growth Report 🔥 (${careerScore || 84}/100 Score)`,
      html: htmlContent,
    });
    console.log(`✓ Daily report email sent to ${email}:`, result);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending daily report email:', error);
    return res.status(500).json({ error: error.message || 'Failed to send daily report email' });
  }
});

module.exports = router;
