# Deployment Checklist

Use this checklist to ensure everything is set up correctly before and after deployment.

## Pre-Deployment Checklist

### Database Setup
- [ ] Run `npm run db:push` to update database schema
- [ ] Verify all new tables created (Story, Message, Block, Report, etc.)
- [ ] Test database connection locally with `npm run db:studio`

### Environment Variables
- [ ] `DATABASE_URL` - Supabase connection string (with connection pooling)
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `NEXTAUTH_SECRET` - Generated secret (32+ characters)
- [ ] `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Your Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- [ ] `CRON_SECRET` - Generated secret for scheduled posts (optional)

### Local Testing
- [ ] App runs locally (`npm run dev`)
- [ ] Can create account and login
- [ ] Can upload images (test with phone)
- [ ] Can upload videos
- [ ] Can create stories
- [ ] Can send messages
- [ ] Search works
- [ ] Notifications appear
- [ ] Post menu works (edit/delete/share)
- [ ] No console errors

### Code Quality
- [ ] `npm run build` succeeds without errors
- [ ] `npm run lint` passes
- [ ] All TypeScript errors resolved
- [ ] Prisma Client generated successfully

## Deployment Steps

### 1. GitHub Setup
- [ ] Code pushed to GitHub
- [ ] All changes committed
- [ ] Main branch is up to date

### 2. Vercel Setup
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] All environment variables added
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `.next` (default)
- [ ] Node version: 18.x or higher

### 3. Environment Variables in Vercel
- [ ] `DATABASE_URL` added
- [ ] `NEXTAUTH_URL` set to production URL
- [ ] `NEXTAUTH_SECRET` added
- [ ] All Cloudinary variables added
- [ ] `CRON_SECRET` added (if using scheduled posts)

### 4. Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete
- [ ] Check build logs for errors
- [ ] Deployment successful

## Post-Deployment Checklist

### Functionality Tests
- [ ] Homepage loads
- [ ] Can sign up new account
- [ ] Can login
- [ ] Can create post with image
- [ ] Can create post with video
- [ ] Can create story
- [ ] Can view stories
- [ ] Can send message
- [ ] Can receive message
- [ ] Can like post
- [ ] Can comment on post
- [ ] Can save post
- [ ] Can share post
- [ ] Can edit own post
- [ ] Can delete own post
- [ ] Can follow user
- [ ] Can block user
- [ ] Can report content
- [ ] Search works
- [ ] Notifications appear
- [ ] Analytics page loads
- [ ] Schedule page loads
- [ ] Settings page loads

### Mobile Testing
- [ ] Can install as PWA
- [ ] Navigation works on mobile
- [ ] Can upload photo from camera roll
- [ ] Can upload video
- [ ] Can take photo with camera
- [ ] Can record video
- [ ] Stories work on mobile
- [ ] Messages work on mobile
- [ ] Touch interactions work

### Performance
- [ ] Pages load quickly
- [ ] Images load properly
- [ ] Videos play
- [ ] No console errors
- [ ] No network errors

### Security
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables not exposed
- [ ] Authentication works
- [ ] Protected routes work
- [ ] Can't access other users' data

## Scheduled Posts Setup

### If Using Scheduled Posts:
- [ ] `vercel.json` created with cron configuration
- [ ] `CRON_SECRET` environment variable set
- [ ] Cron job configured (Vercel Cron or external)
- [ ] Test scheduled post publishes correctly

## Monitoring Setup

### Set Up Monitoring:
- [ ] Vercel analytics enabled (optional)
- [ ] Error tracking set up (optional)
- [ ] Database monitoring (Supabase dashboard)
- [ ] Cloudinary usage monitoring

## Common Issues & Solutions

### Build Fails
**Solution:** Check build logs, ensure all environment variables are set

### Database Connection Error
**Solution:** Verify `DATABASE_URL` uses connection pooling, password is URL-encoded

### Image Upload Fails
**Solution:** Check Cloudinary credentials, verify file size limits

### Messages Not Working
**Solution:** Verify Message table exists, check database connection

### Stories Not Showing
**Solution:** Stories expire after 24 hours, create new ones to test

## Success Criteria

✅ All checklist items completed
✅ App deployed and accessible
✅ Core features working
✅ Mobile experience good
✅ No critical errors

**You're ready to launch! 🚀**