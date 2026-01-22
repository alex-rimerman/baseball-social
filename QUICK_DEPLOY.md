# ⚡ Quick Deploy Guide (5 Minutes)

## Fastest Way: Vercel

### Step 1: Push to GitHub (2 min)

```bash
# If you haven't already
git init
git add .
git commit -m "Ready to deploy"
git branch -M main

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/baseball-social.git
git push -u origin main
```

### Step 2: Deploy on Vercel (3 min)

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → Use GitHub
3. Click "Add New Project"
4. Import your `baseball-social` repository
5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these 5 variables:
     ```
     DATABASE_URL = (your Supabase connection string)
     NEXTAUTH_URL = https://your-app.vercel.app (Vercel will show this after first deploy)
     NEXTAUTH_SECRET = (your secret from .env)
     CLOUDINARY_CLOUD_NAME = (your Cloudinary cloud name)
     CLOUDINARY_API_KEY = (your Cloudinary API key)
     CLOUDINARY_API_SECRET = (your Cloudinary API secret)
     ```
6. Click "Deploy"
7. Wait ~2 minutes
8. **Done!** Your app is live 🎉

### Step 3: Update NEXTAUTH_URL

After first deploy:
1. Copy your Vercel URL (e.g., `https://baseball-social.vercel.app`)
2. Go to Vercel → Your Project → Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your actual Vercel URL
4. Redeploy (or it will auto-redeploy)

---

## Your App is Now:

✅ Live on the internet
✅ Accessible to anyone
✅ Mobile-friendly (PWA)
✅ Installable on phones
✅ Auto-deploys on every git push

---

## Share Your App:

Send this link to friends: `https://your-app.vercel.app`

They can:
- Use it in browser
- Install it on their phone (Add to Home Screen)
- Create accounts and start posting!

---

## Next Steps:

1. **Custom Domain** (optional):
   - Vercel → Settings → Domains
   - Add your domain (e.g., `baseballsocial.com`)

2. **Add App Icons** (for better mobile experience):
   - See `MOBILE_APP.md` for instructions

3. **Monitor Usage**:
   - Vercel dashboard shows analytics
   - Supabase dashboard shows database usage

---

## Troubleshooting:

**Build fails?**
- Check environment variables are all set
- Check build logs in Vercel dashboard

**Can't sign in?**
- Make sure `NEXTAUTH_URL` matches your Vercel domain
- Check `NEXTAUTH_SECRET` is set

**Database errors?**
- Verify `DATABASE_URL` is correct
- Check Supabase dashboard for connection issues

---

**That's it!** Your app is deployed and ready to share! 🚀⚾