const express = require('express');
const router = express.Router();

let Resend;
try {
  const resendPkg = require('resend');
  Resend = resendPkg.Resend || resendPkg;
} catch (e) {
  console.warn('⚠️ resend package failed to load:', e.message);
}

// Initialize Resend
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !Resend) {
    if (!Resend) console.warn('⚠️ resend module not available.');
    if (!apiKey) console.warn('⚠️ RESEND_API_KEY is not set in environment.');
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Generate user's exact designed HTML welcome email
 */
function generateWelcomeEmailHtml({ name, username, email }) {
  const displayName = name || (username ? `@${username}` : 'Developer');
  const message = `Welcome to the community, ${displayName}! Your career command center is ready. Connect your coding profiles, calculate your live career score, and start building your developer identity.`;
  const actionUrl = `https://skillverse-io.web.app/dashboard`;
  const secondaryUrl = `https://skillverse-io.web.app/connections`;
  const websiteUrl = `https://skillverse-io.web.app`;
  const privacyUrl = `https://skillverse-io.web.app/privacy`;
  const termsUrl = `https://skillverse-io.web.app`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />

    <title>Welcome to SkillVerse</title>

    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f6f5f3;
        color: #141211;
        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Arial,
          Helvetica,
          sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      table {
        border-collapse: collapse;
        border-spacing: 0;
      }

      a {
        text-decoration: none;
      }

      .outer {
        width: 100%;
        background: #f6f5f3;
        padding: 42px 16px;
      }

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

      /* =========================
         HEADER
      ========================= */

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

      /* =========================
         HERO
      ========================= */

      .hero {
        padding: 48px 42px 44px;
        background:
          radial-gradient(
            circle at 100% 0%,
            rgba(242, 99, 79, 0.15),
            transparent 36%
          ),
          linear-gradient(
            180deg,
            #fff9f7 0%,
            #ffffff 78%
          );
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
        font-size: 38px;
        line-height: 45px;
        letter-spacing: -1.7px;
        font-weight: 800;
      }

      .accent {
        color: #f2634f;
      }

      .description {
        max-width: 540px;
        margin: 16px 0 0;
        color: #706a66;
        font-size: 16px;
        line-height: 26px;
      }

      /* =========================
         WELCOME CARD
      ========================= */

      .welcome-card {
        margin-top: 32px;
        padding: 23px;
        border: 1px solid #f0d8d2;
        border-radius: 17px;
        background: #fff8f6;
      }

      .welcome-icon {
        display: inline-block;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-radius: 12px;
        background: #f2634f;
        color: #ffffff;
        font-size: 20px;
        font-weight: 700;
      }

      .welcome-heading {
        margin: 16px 0 6px;
        color: #151311;
        font-size: 17px;
        line-height: 23px;
        font-weight: 800;
      }

      .welcome-text {
        margin: 0;
        color: #77716d;
        font-size: 13px;
        line-height: 21px;
      }

      /* =========================
         GET STARTED
      ========================= */

      .steps {
        padding: 34px;
        background: #ffffff;
      }

      .section-label {
        margin-bottom: 17px;
        color: #77716d;
        font-size: 10px;
        line-height: 15px;
        font-weight: 800;
        letter-spacing: 1.4px;
        text-transform: uppercase;
      }

      .step {
        padding: 16px 17px;
        border: 1px solid #e9e5e2;
        border-radius: 14px;
        background: #ffffff;
      }

      .step-number {
        display: inline-block;
        width: 28px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        border-radius: 50%;
        background: #fff0ec;
        color: #f2634f;
        font-size: 12px;
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
        margin: 9px 0 0 37px;
        color: #85807c;
        font-size: 11px;
        line-height: 18px;
      }

      .gap {
        height: 9px;
        line-height: 9px;
        font-size: 1px;
      }

      /* =========================
         CTA
      ========================= */

      .cta-section {
        padding: 2px 34px 38px;
        text-align: left;
      }

      .cta {
        display: inline-block;
        padding: 14px 23px;
        border-radius: 11px;
        background: #f2634f;
        color: #ffffff !important;
        font-size: 14px;
        line-height: 20px;
        font-weight: 750;
      }

      .arrow {
        padding-left: 8px;
        font-size: 16px;
      }

      .secondary {
        display: inline-block;
        margin-left: 17px;
        color: #292522 !important;
        font-size: 13px;
        font-weight: 700;
      }

      /* =========================
         FOOTER
      ========================= */

      .footer {
        padding: 27px 34px 30px;
        background: #faf9f8;
        border-top: 1px solid #eeeae7;
      }

      .footer-brand {
        color: #111111;
        font-size: 15px;
        font-weight: 800;
      }

      .footer-description {
        margin: 7px 0 0;
        color: #8b8581;
        font-size: 12px;
        line-height: 19px;
      }

      .footer-links {
        margin-top: 16px;
        color: #77716d;
        font-size: 11px;
        line-height: 18px;
      }

      .footer-links a {
        color: #77716d;
      }

      .copyright {
        margin-top: 13px;
        color: #aaa49f;
        font-size: 11px;
        line-height: 17px;
      }

      /* =========================
         MOBILE
      ========================= */

      @media only screen and (max-width: 600px) {

        .outer {
          padding: 18px 9px;
        }

        .header {
          padding: 20px;
        }

        .header-label {
          display: none;
        }

        .hero {
          padding: 35px 22px;
        }

        .title {
          font-size: 29px;
          line-height: 36px;
        }

        .description {
          font-size: 15px;
          line-height: 24px;
        }

        .steps {
          padding: 26px 20px;
        }

        .cta-section {
          padding: 0 20px 30px;
        }

        .cta {
          display: block;
          text-align: center;
        }

        .secondary {
          display: block;
          margin: 14px 0 0;
          text-align: center;
        }

        .footer {
          padding: 24px 20px;
        }
      }
    </style>
  </head>

  <body>
    <table role="presentation" width="100%">
      <tr>
        <td class="outer">
          <table role="presentation" class="email" align="center" width="100%">
            <!-- =========================
             HEADER
        ========================== -->

            <tr>
              <td class="header">
                <span class="logo-icon">✦</span>

                <span class="logo-text"> SkillVerse </span>

                <span class="header-label"> Career Intelligence </span>
              </td>
            </tr>

            <!-- =========================
             HERO
        ========================== -->

            <tr>
              <td class="hero">
                <div class="eyebrow">
                  <span class="dot"></span>
                  ACCOUNT WELCOME
                </div>

                <h1 class="title">Welcome to <span class="accent">SkillVerse.</span></h1>

                <p class="description">
                  Your career identity starts here. Build your professional profile, connect your skills, track your
                  progress, and turn your work into opportunities.
                </p>

                <!-- Welcome Card -->

                <div class="welcome-card">
                  <div class="welcome-icon">✦</div>

                  <div class="welcome-heading">You're officially part of SkillVerse.</div>

                  <p class="welcome-text">${message}</p>
                </div>
              </td>
            </tr>

            <!-- =========================
             GET STARTED
        ========================== -->

            <tr>
              <td class="steps">
                <div class="section-label">Your next steps</div>

                <!-- Step 1 -->

                <div class="step">
                  <span class="step-number"> 01 </span>

                  <span class="step-title"> Complete your profile </span>

                  <p class="step-description">
                    Add your education, skills, projects and career information to create your complete professional
                    identity.
                  </p>
                </div>

                <div class="gap">&nbsp;</div>

                <!-- Step 2 -->

                <div class="step">
                  <span class="step-number"> 02 </span>

                  <span class="step-title"> Connect your platforms </span>

                  <p class="step-description">
                    Sync platforms such as GitHub, LeetCode and GeeksforGeeks to bring your real progress into
                    SkillVerse.
                  </p>
                </div>

                <div class="gap">&nbsp;</div>

                <!-- Step 3 -->

                <div class="step">
                  <span class="step-number"> 03 </span>

                  <span class="step-title"> Build your career profile </span>

                  <p class="step-description">
                    Generate resumes, monitor your progress, practice for interviews and discover your next career move.
                  </p>
                </div>
              </td>
            </tr>

            <!-- =========================
             CTA
        ========================== -->

            <tr>
              <td class="cta-section">
                <a href="${actionUrl}" class="cta" target="_blank">
                  Get started
                  <span class="arrow">→</span>
                </a>

                <a href="${secondaryUrl}" class="secondary" target="_blank"> View SkillVerse </a>
              </td>
            </tr>

            <!-- =========================
             FOOTER
        ========================== -->

            <tr>
              <td class="footer">
                <div class="footer-brand">✦ SkillVerse</div>

                <p class="footer-description">Your career identity, progress and growth — in one place.</p>

                <div class="footer-links">
                  <a href="${websiteUrl}"> SkillVerse </a>

                  &nbsp;&nbsp;•&nbsp;&nbsp;

                  <a href="${privacyUrl}"> Privacy </a>

                  &nbsp;&nbsp;•&nbsp;&nbsp;

                  <a href="${termsUrl}"> Terms </a>
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
  const htmlContent = generateWelcomeEmailHtml({ name: 'Thehseen Shaik', username: 'thehseen', email });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Welcome to SkillVerse! ✦',
      html: htmlContent,
    });

    return res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
