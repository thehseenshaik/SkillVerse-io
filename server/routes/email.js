const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

// Initialize Resend
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY is not set in environment.');
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Generate high-conversion, responsive HTML welcome email
 */
function generateWelcomeEmailHtml({ name, username, email }) {
  const displayName = name || username || 'Developer';
  const profileUrl = username 
    ? `https://skillverse-io.web.app/u/${username}`
    : `https://skillverse-io.web.app/dashboard`;
  const dashboardUrl = `https://skillverse-io.web.app/dashboard`;
  const resumeUrl = `https://skillverse-io.web.app/resume`;
  const connectionsUrl = `https://skillverse-io.web.app/connections`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SkillVerse</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0f172a;
      padding: 40px 0;
    }
    .main {
      background-color: #1e293b;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-radius: 24px;
      border: 1px solid #334155;
      overflow: hidden;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%);
      padding: 36px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 26px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 6px 0 0 0;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 16px 0;
    }
    .intro {
      font-size: 15px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 28px 0;
    }
    .card {
      background-color: #0f172a;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .step-item {
      display: flex;
      margin-bottom: 14px;
    }
    .step-item:last-child {
      margin-bottom: 0;
    }
    .step-title {
      font-size: 14px;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 2px;
    }
    .step-desc {
      font-size: 12px;
      color: #64748b;
    }
    .cta-button {
      display: inline-block;
      width: 100%;
      box-sizing: border-box;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: #ffffff !important;
      text-decoration: none;
      text-align: center;
      font-weight: 700;
      font-size: 15px;
      padding: 16px 24px;
      border-radius: 14px;
      box-shadow: 0 4px 15px rgba(234, 88, 12, 0.4);
      margin: 10px 0 24px 0;
    }
    .footer {
      border-top: 1px solid #334155;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: #f97316;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="header">
          <h1>SkillVerse</h1>
          <p>Career Operating System</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h2 class="greeting">Welcome aboard, ${displayName}! 🚀</h2>
          <p class="intro">
            Your all-in-one developer command center is ready. SkillVerse connects your coding profiles, tracks your telemetry, tests your skills, and builds ATS-optimized resumes.
          </p>

          <div class="card">
            <div style="font-size: 11px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
              ⚡ Quick Start Checklist
            </div>
            
            <div style="padding-bottom: 10px; border-bottom: 1px solid #1e293b; margin-bottom: 10px;">
              <div class="step-title">1. Connect Your Profiles</div>
              <div class="step-desc">Sync your LeetCode, GitHub & GeeksforGeeks handles in the Connections Hub.</div>
            </div>

            <div style="padding-bottom: 10px; border-bottom: 1px solid #1e293b; margin-bottom: 10px;">
              <div class="step-title">2. Calculate Your Live Career Score</div>
              <div class="step-desc">Get a 0-100 real-time rating benchmarked against top tech roles.</div>
            </div>

            <div>
              <div class="step-title">3. Export Your ATS Resume</div>
              <div class="step-desc">Turn your telemetry & projects into a recruiter-ready ATS PDF in 1 click.</div>
            </div>
          </div>

          <a href="${dashboardUrl}" class="cta-button">
            Launch Your Career Command Center →
          </a>

          ${username ? `
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            Your public portfolio is live at: <a href="${profileUrl}" style="color: #f97316; font-weight: 600;">${profileUrl}</a>
          </p>
          ` : ''}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="margin: 0 0 8px 0;">SkillVerse · Built for Modern Software Engineers</p>
          <p style="margin: 0;">
            <a href="${dashboardUrl}">Dashboard</a> · 
            <a href="${resumeUrl}">Resume Studio</a> · 
            <a href="${connectionsUrl}">Connections Hub</a>
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}

/**
 * POST /api/email/welcome
 * Send welcome email to a new user
 */
router.post('/welcome', async (req, res) => {
  const { email, name, username } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const resend = getResendClient();
  if (!resend) {
    return res.status(500).json({ error: 'Resend is not configured on this server.' });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'SkillVerse <onboarding@resend.dev>';
  const htmlContent = generateWelcomeEmailHtml({ name, username, email });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `Welcome to SkillVerse, ${name || username || 'Developer'}! 🚀`,
      html: htmlContent,
    });

    console.log(`✓ Welcome email sent to ${email}:`, result);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending welcome email via Resend:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to send welcome email',
      details: error
    });
  }
});

/**
 * POST /api/email/test
 * Test email sending
 */
router.post('/test', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Target email is required' });
  }

  const resend = getResendClient();
  if (!resend) {
    return res.status(500).json({ error: 'Resend is not configured on this server.' });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'SkillVerse <onboarding@resend.dev>';

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'SkillVerse Email Integration Test ✅',
      html: '<p>This is a confirmation that your <strong>Resend</strong> integration with SkillVerse is working perfectly!</p>',
    });

    return res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
