# 🔥 Firebase Email Template Setup - Step-by-Step Guide

## Quick Setup (5 minutes)

### Step 1: Open Firebase Console

👉 **Click this link:** https://console.firebase.google.com/

### Step 2: Select Your Project

- Click on **SkillVerse** (skillverse-13b58)
- Or select it from the project dropdown

### Step 3: Navigate to Authentication Templates

1. Click **Authentication** in the left sidebar
2. Click the **Templates** tab (it's at the top, next to "Users")
3. Select **Email verification** from the template types

### Step 4: Customize the Email Template

1. Click the **Customize** button (pencil icon)
2. You'll see an email editor with:
   - **Subject line** (top)
   - **HTML body** (main editor)
   - **Plain text body** (bottom section)

### Step 5: Apply the Premium Template

#### A. Update the Subject Line:

#### B. For the HTML Section:

1. Open the file: `firebase-email-template.html`
2. Copy all the content (Ctrl+A, Ctrl+C)
3. Paste it into the HTML editor (Ctrl+V)
4. Important: Keep these variables exactly as they are:
   - `{{email}}` - Firebase will replace this with the user's email
   - `{{actionLink}}` - Firebase will replace this with the sign-in link

#### C. For the Plain Text Section:

1. Open the file: `firebase-email-template-text.txt`
2. Copy all the content
3. Paste it into the plain text editor

### Step 6: Update Your Logo (Optional)

Replace the logo URL in the HTML template:

```html
<!-- Current placeholder -->
<img src="https://skillverse.io/logo.png" alt="SkillVerse Logo" />

<!-- Replace with your actual logo URL -->
<img src="YOUR_LOGO_URL_HERE" alt="SkillVerse Logo" />
```

### Step 7: Test the Template

1. Click the **Send test email** button
2. Enter your email address
3. Check your inbox to see the premium design

### Step 8: Save and Activate

1. Click **Save** (top right)
2. The template is now active for all authentication emails

## Template Features Included:

✅ Premium ember orange gradient matching your website
✅ Professional card-based design  
✅ Mobile-responsive layout
✅ Glass morphism effects
✅ Security details box
✅ Professional CTA button
✅ Brand-consistent typography

## Files Created:

- `firebase-email-template.html` - Premium HTML template
- `firebase-email-template-text.txt` - Plain text version
- `FIREBASE_EMAIL_SETUP.md` - Technical documentation

## Need Help?

- Firebase Documentation: https://firebase.google.com/docs/auth/custom-email-templates
- Support: https://firebase.google.com/support/

---

**⏱️ Time Required:** 5 minutes
**🎯 Difficulty:** Easy - just copy and paste!
