# How to Bulk Upload Environment Variables to Vercel

This guide shows you how to upload ALL your environment variables to Vercel at once, instead of adding them one by one.

## 🎯 The Problem

Adding 10+ environment variables one-by-one in Vercel dashboard is tedious and error-prone.

## ✅ The Solution

Upload your entire `.env.local` file at once!

---

## Method 1: Vercel Dashboard (Easiest - Recommended!)

### Step 1: Copy Your .env.local File

1. Open your `.env.local` file
2. Select ALL content (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)

### Step 2: Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Click on your project
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar

### Step 3: Bulk Paste

1. Look for the **"Paste .env"** button or text area
2. Click it
3. Paste your entire `.env.local` content
4. Vercel will automatically parse all variables!
5. Select environments (Production, Preview, Development)
6. Click **Save** or **Add**

**That's it!** All variables added in seconds! 🎉

---

## Method 2: Vercel CLI (For Advanced Users)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Link Your Project

```bash
cd c:\Users\mrtan\OneDrive\Desktop\paraglidingwebapp
vercel link
```

### Step 4: Pull Current Variables (Optional)

To see what's already in Vercel:

```bash
vercel env pull .env.vercel
```

### Step 5: Add All Variables from .env.local

There are two ways:

#### Option A: Interactive (One at a time, but scripted)

```bash
# This command reads your .env.local and adds each variable
vercel env add < .env.local
```

#### Option B: Manual Push (Copy-paste approach)

Unfortunately, Vercel CLI doesn't have a direct "bulk upload" command, so the dashboard method (Method 1) is actually faster!

---

## Method 3: Using vercel.json (Not Recommended)

⚠️ **WARNING**: DO NOT use this method for secrets!

You CAN add environment variables to `vercel.json`, but:
- This file gets committed to Git
- Your secrets would be exposed
- GitHub will block the push

**Only use this for non-sensitive public variables like:**

```json
{
  "env": {
    "NEXT_PUBLIC_APP_NAME": "Oludeniz Tours",
    "NEXT_PUBLIC_APP_URL": "https://yourapp.vercel.app"
  }
}
```

---

## 📋 What Should Be in Each File

### .env.local (Local Development - NEVER COMMIT)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...

# Google
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_CALENDAR_ID=xxxxx@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxxxx@xxxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WhatsApp (if using)
WHATSAPP_PHONE_NUMBER_ID=xxxxx
WHATSAPP_BUSINESS_ACCOUNT_ID=xxxxx
WHATSAPP_ACCESS_TOKEN=EAAxxxxx
WHATSAPP_VERIFY_TOKEN=your-secret-token
WHATSAPP_API_VERSION=v18.0

# n8n (if using)
N8N_WEBHOOK_URL=https://xxxxx.app.n8n.cloud/webhook/xxxxx/chat
```

### .env.local.example (Commit This to Git)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Calendar API
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WhatsApp Business API (Optional)
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_ACCESS_TOKEN=your-permanent-access-token
WHATSAPP_VERIFY_TOKEN=your-custom-webhook-verify-token
WHATSAPP_API_VERSION=v18.0

# n8n Webhook (Optional)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id/chat
```

---

## 🔒 Security Checklist

Before pushing to GitHub, verify:

- [ ] `.env.local` is in `.gitignore` ✅
- [ ] `.env.local.example` only has placeholder values ✅
- [ ] No real secrets in documentation files ✅
- [ ] No `MY_VERCEL_ENV_VALUES.md` or similar files with real secrets ✅
- [ ] No service account JSON files committed ✅

---

## 🚀 Quick Start Workflow

### First Time Setup:

1. **Create `.env.local`** with your real secrets (already done! ✅)

2. **Upload to Vercel via Dashboard:**
   - Copy entire `.env.local` content
   - Go to Vercel → Settings → Environment Variables
   - Paste .env content
   - Save

3. **Update `.env.local.example`** with placeholders only

4. **Commit to GitHub:**
   ```bash
   git add .env.local.example
   git commit -m "Add env example file"
   git push
   ```

### After Changing Environment Variables:

**Option A: Update in Vercel Dashboard**
1. Go to Vercel → Settings → Environment Variables
2. Edit the specific variable
3. Save
4. Redeploy

**Option B: Re-paste Entire .env**
1. Update `.env.local` locally
2. Copy all content
3. Delete old variables in Vercel (or let it overwrite)
4. Paste new .env content
5. Save
6. Redeploy

---

## 🔄 Keeping Environments in Sync

### Local → Vercel:
```bash
# Copy from .env.local, paste in Vercel dashboard
```

### Vercel → Local:
```bash
vercel env pull .env.local
```

This downloads all Vercel environment variables to your local `.env.local`

---

## ⚡ Pro Tips

1. **Use Environment Naming:**
   - Production: Real credentials
   - Preview: Staging/test credentials
   - Development: Can use same as local

2. **NEXT_PUBLIC_ Variables:**
   - These are exposed to the browser
   - Only use for non-sensitive data
   - Examples: API URLs, feature flags

3. **Secret Variables:**
   - Never use NEXT_PUBLIC_ prefix
   - Examples: API keys, database passwords
   - Only accessible server-side

4. **Update After Deploy:**
   - If you change `NEXT_PUBLIC_APP_URL` after first deploy
   - Update it to your real Vercel URL
   - Redeploy to apply changes

---

## 🆘 Troubleshooting

### "Missing environment variables" error

**Solution:**
1. Go to Vercel dashboard
2. Check all variables are in correct environment (Production/Preview/Development)
3. Redeploy

### Variables not updating

**Solution:**
1. After changing variables in Vercel
2. Go to Deployments
3. Click ⋯ on latest deployment
4. Click "Redeploy"

### Private key not working

**Solution:**
Make sure the private key format is correct:
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```
- Keep the quotes
- Keep the \n characters
- No extra spaces

---

## 📊 Comparison: Dashboard vs CLI

| Feature | Dashboard | CLI |
|---------|-----------|-----|
| Bulk upload | ✅ Easy (.env paste) | ❌ No bulk command |
| Speed | ⚡ Fastest | 🐌 Slow (one by one) |
| Visual | ✅ See all variables | ❌ Terminal only |
| Beginner friendly | ✅ Yes | ❌ Requires setup |
| **Recommendation** | **✅ Use this!** | For automation only |

---

**Bottom line: Use the Vercel Dashboard's "Paste .env" feature - it's the fastest and easiest way!** 🎯
