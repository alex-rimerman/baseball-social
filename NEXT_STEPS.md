# Next Steps - Complete Setup Guide

## Step 1: Update Your Database Schema

The database schema has been updated with new models (Stories, Messages, Blocks, Reports, etc.). You need to push these changes to your database.

### Run this command:
```bash
npm run db:push
```

**What this does:**
- Creates new tables: Story, StoryView, Block, Message, Report
- Adds new fields to existing tables: `isPrivate` on User, `scheduledFor` on Post
- Updates indexes for better performance

**Expected output:**
- Should show "Your database is now in sync with your schema"
- If you see errors, check your `DATABASE_URL` in `.env`

---

## Step 2: Verify Environment Variables

Make sure your `.env` file has ALL of these variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true&sslmode=require&schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"  # Change to your production URL when deploying
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# Cloudinary (for image/video uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Optional: For scheduled posts cron job
CRON_SECRET="your-cron-secret"  # Generate with: openssl rand -base64 32
```

### To generate secrets:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CRON_SECRET
openssl rand -base64 32
```

---

## Step 3: Test Locally

### Start the development server:
```bash
npm run dev
```

### Test these features:
1. **Sign up/Login** - Create an account at `http://localhost:3000/auth/signin`
2. **Create a post** - Go to `/create` and upload an image/video
3. **Create a story** - Click on "Your story" in the stories section
4. **Send a message** - Go to `/messages` or click "Message" on a profile
5. **Test search** - Go to `/discover` and try searching
6. **Check notifications** - Like/comment on posts to see notifications
7. **Test post menu** - Click the "..." on any post to see edit/delete/share options

---

## Step 4: Set Up Scheduled Posts (Optional but Recommended)

Scheduled posts require a cron job to publish them automatically.

### Option A: Vercel Cron (Recommended if deploying to Vercel)

1. Create `vercel.json` in your project root:
```json
{
  "crons": [{
    "path": "/api/cron/publish-scheduled",
    "schedule": "* * * * *"
  }]
}
```

2. Add `CRON_SECRET` to your Vercel environment variables
3. The cron job will run automatically every minute

### Option B: External Cron Service

Use a service like:
- **cron-job.org** (free)
- **EasyCron** (free tier)
- **GitHub Actions** (free)

Set it to call: `https://your-domain.com/api/cron/publish-scheduled?authorization=Bearer YOUR_CRON_SECRET`

**Schedule:** Every minute (`* * * * *`)

---

## Step 5: Deploy to Vercel

### 5.1 Push to GitHub

```bash
# If you haven't already
git add .
git commit -m "Complete social media app with all features"
git push origin main
```

### 5.2 Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 5.3 Add Environment Variables in Vercel

Go to **Settings → Environment Variables** and add:

```
DATABASE_URL = (your Supabase connection string)
NEXTAUTH_URL = https://your-app.vercel.app
NEXTAUTH_SECRET = (your generated secret)
CLOUDINARY_CLOUD_NAME = (your Cloudinary cloud name)
CLOUDINARY_API_KEY = (your Cloudinary API key)
CLOUDINARY_API_SECRET = (your Cloudinary API secret)
CRON_SECRET = (your generated cron secret - optional)
```

**Important:** 
- Use the **Connection Pooling** URL from Supabase (not direct connection)
- URL-encode special characters in passwords (e.g., `$` becomes `%24`)

### 5.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-app.vercel.app`

---

## Step 6: Post-Deployment Checklist

### ✅ Verify These Work:

- [ ] User registration and login
- [ ] Creating posts with images/videos
- [ ] Creating stories
- [ ] Sending messages
- [ ] Notifications appear
- [ ] Search functionality
- [ ] Post editing/deletion
- [ ] User blocking/reporting
- [ ] Analytics page loads
- [ ] Scheduled posts page loads

### ✅ Test on Mobile:

- [ ] Install as PWA (Add to Home Screen)
- [ ] Upload photos from camera roll
- [ ] Upload videos
- [ ] Navigation works
- [ ] Messages work
- [ ] Stories work

---

## Step 7: Set Up Cloudinary (If Not Done)

1. Go to [cloudinary.com](https://cloudinary.com) and sign up (free tier available)
2. Get your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Add them to your `.env` file and Vercel environment variables

---

## Step 8: Configure Supabase Database

### 8.1 Get Connection String

1. Go to your Supabase project
2. Navigate to **Settings → Database**
3. Under "Connection string", select **"Connection Pooling"**
4. Copy the URI (it should look like: `postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres`)
5. Replace `[PASSWORD]` with your actual password (URL-encoded)
6. Add `?pgbouncer=true&sslmode=require&schema=public` at the end

### 8.2 URL-Encode Special Characters

If your password contains special characters:
- `$` → `%24`
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

Example:
```
Original: MyP@ss$word
Encoded:  MyP%40ss%24word
```

---

## Step 9: First User Setup

After deployment:

1. **Create your first account** at `/auth/signin`
2. **Upload a profile picture**
3. **Fill out your profile** (bio, favorite team, location)
4. **Create a test post** to verify uploads work
5. **Create a story** to test stories
6. **Invite friends** to create accounts

---

## Step 10: Monitor & Maintain

### Check These Regularly:

1. **Vercel Dashboard** - Monitor build logs and errors
2. **Supabase Dashboard** - Check database usage
3. **Cloudinary Dashboard** - Monitor storage usage
4. **Error Logs** - Check Vercel function logs for API errors

### Common Issues & Fixes:

**Issue: Posts not showing**
- Check if `scheduledFor` is null (scheduled posts won't show until published)
- Verify database connection

**Issue: Images not uploading**
- Check Cloudinary credentials
- Verify file size limits (20MB images, 100MB videos)

**Issue: Messages not sending**
- Check if users are blocked
- Verify database has Message table

**Issue: Stories not appearing**
- Stories expire after 24 hours
- Check if stories are created with valid expiration date

---

## Quick Command Reference

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Support & Troubleshooting

### If Build Fails on Vercel:

1. Check build logs in Vercel dashboard
2. Common issues:
   - Missing environment variables
   - Prisma Client not generated (should be handled by `postinstall` script)
   - TypeScript errors (check `npm run build` locally first)

### If Database Errors:

1. Verify `DATABASE_URL` is correct
2. Check Supabase connection pooling is enabled
3. Ensure password is URL-encoded
4. Test connection with: `npm run db:studio`

### If Upload Errors:

1. Verify Cloudinary credentials
2. Check file size (max 20MB images, 100MB videos)
3. Check Cloudinary account limits

---

## You're All Set! 🎉

Your social media app is now complete with:
- ✅ Full user authentication
- ✅ Posts with images/videos
- ✅ Stories (24-hour)
- ✅ Direct messaging
- ✅ Notifications
- ✅ Search & discovery
- ✅ Analytics
- ✅ Post scheduling
- ✅ User blocking/reporting
- ✅ And much more!

**Next:** Start inviting users and building your community! 🚀