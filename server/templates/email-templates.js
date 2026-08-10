/**
 * SkillVerse Master Email Template Engine
 * Generates unified, high-conversion, responsive emails with the signature SkillVerse theme.
 */

function getBaseEmailLayout({
  eyebrowText = "ACCOUNT NOTIFICATION",
  titleHtml = 'Welcome to <span style="color: #f2634f;">SkillVerse.</span>',
  description = "Your career identity starts here. Build your professional profile, track your progress, and turn your work into opportunities.",
  cardHeading = "Account Notification",
  cardText = "",
  stepsLabel = "Important Information",
  steps = [],
  ctaText = "Get Started",
  ctaUrl = "https://skillverse-io.web.app/dashboard",
  secondaryText = "View SkillVerse",
  secondaryUrl = "https://skillverse-io.web.app",
  websiteUrl = "https://skillverse-io.web.app",
  privacyUrl = "https://skillverse-io.web.app/privacy",
  termsUrl = "https://skillverse-io.web.app",
}) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>SkillVerse</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f6f5f3;
        color: #141211;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      table { border-collapse: collapse; border-spacing: 0; }
      a { text-decoration: none; }
      .outer { width: 100%; background: #f6f5f3; padding: 42px 16px; }
      .email {
        width: 100%;
        max-width: 650px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #e6e2df;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 18px 50px rgba(30, 25, 22, 0.08);
      }
      .header {
        padding: 23px 34px;
        background: #ffffff;
        border-bottom: 1px solid #eeeae7;
      }
      .logo-icon {
        display: inline-block;
        width: 31px;
        height: 31px;
        line-height: 31px;
        text-align: center;
        border-radius: 9px;
        background: #fff0ec;
        color: #f2634f;
        font-size: 18px;
        font-weight: 800;
        vertical-align: middle;
      }
      .logo-text {
        display: inline-block;
        margin-left: 9px;
        color: #111111;
        font-size: 20px;
        line-height: 31px;
        font-weight: 800;
        letter-spacing: -0.6px;
        vertical-align: middle;
      }
      .header-label {
        float: right;
        margin-top: 7px;
        color: #8c8682;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.1px;
        text-transform: uppercase;
      }
      .hero {
        padding: 48px 42px 40px;
        background:
          radial-gradient(circle at 100% 0%, rgba(242, 99, 79, 0.15), transparent 36%),
          linear-gradient(180deg, #fff9f7 0%, #ffffff 78%);
      }
      .eyebrow {
        display: inline-block;
        padding: 7px 12px;
        border: 1px solid #f2d0c9;
        border-radius: 999px;
        background: rgba(255,255,255,0.82);
        color: #ef604c;
        font-size: 10px;
        line-height: 14px;
        font-weight: 800;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        margin-right: 6px;
        border-radius: 50%;
        background: #f2634f;
        vertical-align: middle;
      }
      .title {
        margin: 21px 0 0;
        color: #111111;
        font-size: 36px;
        line-height: 44px;
        letter-spacing: -1.7px;
        font-weight: 800;
      }
      .description {
        max-width: 540px;
        margin: 16px 0 0;
        color: #706a66;
        font-size: 15px;
        line-height: 25px;
      }
      .welcome-card {
        margin-top: 28px;
        padding: 22px;
        border: 1px solid #f0d8d2;
        border-radius: 17px;
        background: #fff8f6;
      }
      .welcome-icon {
        display: inline-block;
        width: 38px;
        height: 38px;
        line-height: 38px;
        text-align: center;
        border-radius: 12px;
        background: #f2634f;
        color: #ffffff;
        font-size: 18px;
        font-weight: 700;
      }
      .welcome-heading {
        margin: 14px 0 6px;
        color: #151311;
        font-size: 16px;
        line-height: 22px;
        font-weight: 800;
      }
      .welcome-text {
        margin: 0;
        color: #77716d;
        font-size: 13px;
        line-height: 21px;
      }
      .steps { padding: 32px 34px; background: #ffffff; }
      .section-label {
        margin-bottom: 16px;
        color: #77716d;
        font-size: 10px;
        line-height: 15px;
        font-weight: 800;
        letter-spacing: 1.4px;
        text-transform: uppercase;
      }
      .step {
        padding: 16px 18px;
        border: 1px solid #e9e5e2;
        border-radius: 14px;
        background: #ffffff;
        margin-bottom: 10px;
      }
      .step-number {
        display: inline-block;
        width: 26px;
        height: 26px;
        line-height: 26px;
        text-align: center;
        border-radius: 50%;
        background: #fff0ec;
        color: #f2634f;
        font-size: 11px;
        font-weight: 800;
        vertical-align: middle;
      }
      .step-title {
        display: inline-block;
        margin-left: 9px;
        color: #171513;
        font-size: 13px;
        line-height: 18px;
        font-weight: 750;
        vertical-align: middle;
      }
      .step-description {
        margin: 8px 0 0 35px;
        color: #85807c;
        font-size: 12px;
        line-height: 19px;
      }
      .cta-section { padding: 4px 34px 38px; text-align: left; }
      .cta {
        display: inline-block;
        padding: 14px 24px;
        border-radius: 12px;
        background: #f2634f;
        color: #ffffff !important;
        font-size: 14px;
        line-height: 20px;
        font-weight: 750;
      }
      .arrow { padding-left: 8px; font-size: 16px; }
      .secondary {
        display: inline-block;
        margin-left: 16px;
        color: #292522 !important;
        font-size: 13px;
        font-weight: 700;
      }
      .footer {
        padding: 26px 34px 30px;
        background: #faf9f8;
        border-top: 1px solid #eeeae7;
      }
      .footer-brand { color: #111111; font-size: 15px; font-weight: 800; }
      .footer-description { margin: 6px 0 0; color: #8b8581; font-size: 12px; line-height: 19px; }
      .footer-links { margin-top: 14px; color: #77716d; font-size: 11px; line-height: 18px; }
      .footer-links a { color: #77716d; }
      .copyright { margin-top: 12px; color: #aaa49f; font-size: 11px; line-height: 17px; }
      @media only screen and (max-width: 600px) {
        .outer { padding: 18px 9px; }
        .header { padding: 20px; }
        .header-label { display: none; }
        .hero { padding: 35px 22px; }
        .title { font-size: 28px; line-height: 35px; }
        .steps { padding: 24px 20px; }
        .cta-section { padding: 0 20px 30px; }
        .cta { display: block; text-align: center; }
        .secondary { display: block; margin: 14px 0 0; text-align: center; }
        .footer { padding: 24px 20px; }
      }
    </style>
  </head>
  <body>
    <table role="presentation" width="100%">
      <tr>
        <td class="outer">
          <table role="presentation" class="email" align="center" width="100%">
            <!-- HEADER -->
            <tr>
              <td class="header">
                <span class="logo-icon">✦</span>
                <span class="logo-text">SkillVerse</span>
                <span class="header-label">Career Intelligence</span>
              </td>
            </tr>

            <!-- HERO -->
            <tr>
              <td class="hero">
                <div class="eyebrow">
                  <span class="dot"></span>
                  ${eyebrowText}
                </div>

                <h1 class="title">${titleHtml}</h1>
                <p class="description">${description}</p>

                <!-- CARD -->
                <div class="welcome-card">
                  <div class="welcome-icon">✦</div>
                  <div class="welcome-heading">${cardHeading}</div>
                  <p class="welcome-text">${cardText}</p>
                </div>
              </td>
            </tr>

            <!-- STEPS / DETAILS -->
            ${steps && steps.length > 0 ? `
            <tr>
              <td class="steps">
                <div class="section-label">${stepsLabel}</div>
                ${steps.map((s, idx) => `
                <div class="step">
                  <span class="step-number">0${idx + 1}</span>
                  <span class="step-title">${s.title}</span>
                  <p class="step-description">${s.description}</p>
                </div>
                `).join('')}
              </td>
            </tr>
            ` : ''}

            <!-- CTA -->
            <tr>
              <td class="cta-section">
                <a href="${ctaUrl}" class="cta" target="_blank">
                  ${ctaText}
                  <span class="arrow">→</span>
                </a>
                <a href="${secondaryUrl}" class="secondary" target="_blank">${secondaryText}</a>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td class="footer">
                <div class="footer-brand">✦ SkillVerse</div>
                <p class="footer-description">Your career identity, progress and growth — in one place.</p>
                <div class="footer-links">
                  <a href="${websiteUrl}">SkillVerse</a>
                  &nbsp;&nbsp;•&nbsp;&nbsp;
                  <a href="${privacyUrl}">Privacy</a>
                  &nbsp;&nbsp;•&nbsp;&nbsp;
                  <a href="${termsUrl}">Terms</a>
                </div>
                <div class="copyright">© 2026 SkillVerse. All rights reserved.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * 1. FORGOT PASSWORD / PASSWORD RESET EMAIL
 */
function generateForgotPasswordEmail({ email, resetUrl, name }) {
  const displayName = name || (email ? email.split('@')[0] : 'Developer');
  const actionLink = resetUrl || `https://skillverse-io.web.app/forgot-password`;

  return getBaseEmailLayout({
    eyebrowText: "PASSWORD RECOVERY",
    titleHtml: 'Reset Your <span style="color: #f2634f;">Password.</span>',
    description: `Hi ${displayName}, we received a request to reset the password associated with your SkillVerse account. Click the secure link below to proceed.`,
    cardHeading: "Password Reset Requested",
    cardText: `This password reset link will expire in 60 minutes for your security. If you did not make this request, you can safely ignore this email.`,
    stepsLabel: "Security Guidelines",
    steps: [
      {
        title: "Create a strong password",
        description: "Use at least 8 characters with a mix of uppercase letters, numbers, and symbols.",
      },
      {
        title: "Do not share this link",
        description: "SkillVerse staff will never ask you for your password or reset link.",
      },
      {
        title: "Need immediate login?",
        description: "You can also sign in directly using Google Authentication if previously connected.",
      }
    ],
    ctaText: "Reset Password",
    ctaUrl: actionLink,
    secondaryText: "Login to SkillVerse",
    secondaryUrl: "https://skillverse-io.web.app/login",
  });
}

/**
 * 2. NEW LOGIN DETECTED / SECURITY ALERT EMAIL
 */
function generateLoginDetectedEmail({ email, name, ipAddress = "192.168.1.1", browser = "Chrome on Windows", location = "India", time = new Date().toUTCString() }) {
  const displayName = name || (email ? email.split('@')[0] : 'Developer');

  return getBaseEmailLayout({
    eyebrowText: "SECURITY ALERT",
    titleHtml: 'New Login <span style="color: #f2634f;">Detected.</span>',
    description: `Hi ${displayName}, your SkillVerse account was recently accessed from a new browser or location.`,
    cardHeading: `Login from ${browser}`,
    cardText: `Timestamp: <strong>${time}</strong><br>Location: <strong>${location}</strong><br>IP Address: <strong>${ipAddress}</strong>`,
    stepsLabel: "What You Should Do",
    steps: [
      {
        title: "If this was you",
        description: "You can safely ignore this notification. No further action is required.",
      },
      {
        title: "If this wasn't you",
        description: "Change your password immediately to protect your profile, connected platforms, and saved resumes.",
      },
      {
        title: "Review connected accounts",
        description: "Check your Connections Hub to ensure all platform handles (GitHub, LeetCode) are verified.",
      }
    ],
    ctaText: "Review Account Security",
    ctaUrl: "https://skillverse-io.web.app/settings",
    secondaryText: "Change Password",
    secondaryUrl: "https://skillverse-io.web.app/change-password",
  });
}

/**
 * 3. PASSWORD CHANGED CONFIRMATION EMAIL
 */
function generatePasswordChangedEmail({ email, name, time = new Date().toUTCString() }) {
  const displayName = name || (email ? email.split('@')[0] : 'Developer');

  return getBaseEmailLayout({
    eyebrowText: "ACCOUNT UPDATE",
    titleHtml: 'Password Successfully <span style="color: #f2634f;">Updated.</span>',
    description: `Hi ${displayName}, the password for your SkillVerse account was updated on ${time}.`,
    cardHeading: "Your account is secure",
    cardText: "You can now use your updated credentials to access your Career Command Center, AI Copilot, and Resume Studio.",
    stepsLabel: "Next Steps",
    steps: [
      {
        title: "Sign in with new password",
        description: "Test your new login credentials on web or mobile devices.",
      },
      {
        title: "Keep your recovery info up to date",
        description: "Ensure your verified email and linked GitHub account remain active.",
      }
    ],
    ctaText: "Login to SkillVerse",
    ctaUrl: "https://skillverse-io.web.app/login",
    secondaryText: "Open Dashboard",
    secondaryUrl: "https://skillverse-io.web.app/dashboard",
  });
}

/**
 * 4. DAILY CAREER REPORT / TELEMETRY DIGEST EMAIL
 */
function generateDailyReportEmail({ 
  email, 
  name, 
  careerScore = 84, 
  streakDays = 5, 
  solvedCount = 38, 
  topSkill = "Data Structures & Algorithms",
  recommendedProblem = "Valid Parentheses (LeetCode #20)"
}) {
  const displayName = name || (email ? email.split('@')[0] : 'Developer');

  return getBaseEmailLayout({
    eyebrowText: "DAILY CAREER DIGEST",
    titleHtml: 'Your Daily <span style="color: #f2634f;">Growth Report.</span>',
    description: `Good morning ${displayName}! Here is your 24-hour developer progress snapshot across your connected coding profiles.`,
    cardHeading: `Career Score: ${careerScore}/100 · ${streakDays}-Day Streak 🔥`,
    cardText: `You have solved <strong>${solvedCount} problems</strong> total across LeetCode & GeeksforGeeks. Your consistency index is in the <strong>Top 15%</strong> of active engineers.`,
    stepsLabel: "Today's Recommended Focus",
    steps: [
      {
        title: "Recommended Problem",
        description: `Solve <strong>${recommendedProblem}</strong> to maintain your active daily streak.`,
      },
      {
        title: "ATS Resume Check",
        description: "Your resume readiness is at 100%. One-click ATS PDF export is ready for recruiters.",
      },
      {
        title: "Aptitude Arena Challenge",
        description: "Complete today's 5-minute quantitative practice module to boost your interview readiness.",
      }
    ],
    ctaText: "Open Career Command Center",
    ctaUrl: "https://skillverse-io.web.app/dashboard",
    secondaryText: "View Developer Telemetry",
    secondaryUrl: "https://skillverse-io.web.app/analytics",
  });
}

module.exports = {
  getBaseEmailLayout,
  generateForgotPasswordEmail,
  generateLoginDetectedEmail,
  generatePasswordChangedEmail,
  generateDailyReportEmail,
};
