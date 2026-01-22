# 🚀 Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest for Next.js)

**Why Vercel?**
- Built by the Next.js team
- Free tier available
- Automatic deployments from GitHub
- Zero configuration needed

**Steps:**

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/baseball-social.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variables:
     ```
     DATABASE_URL=your-supabase-connection-string
     NEXTAUTH_URL=https://your-app.vercel.app
     NEXTAUTH_SECRET=your-secret-key
     CLOUDINARY_CLOUD_NAME=your-cloud-name
     CLOUDINARY_API_KEY=your-api-key
     CLOUDINARY_API_SECRET=your-api-secret
     ```
   - Click "Deploy"
   - Done! Your app will be live in ~2 minutes

3. **Update Supabase Settings**
   - Go to Supabase Dashboard → Settings → API
   - Add your Vercel URL to allowed origins if needed

---

### Option 2: Railway

**Steps:**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Next.js
6. Add environment variables in the Variables tab
7. Deploy!

**Note:** Railway provides PostgreSQL, but you can still use Supabase if preferred.

---

### Option 3: Render

**Steps:**

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Add environment variables
7. Deploy!

---

### Option 4: Self-Hosted (VPS)

**For DigitalOcean, AWS, etc.:**

1. **Set up server**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

2. **Clone and build**
   ```bash
   git clone https://github.com/YOUR_USERNAME/baseball-social.git
   cd baseball-social
   npm install
   npm run build
   ```

3. **Set up environment variables**
   ```bash
   nano .env
   # Add all your environment variables
   ```

4. **Start with PM2**
   ```bash
   pm2 start npm --name "baseball-social" -- start
   pm2 save
   pm2 startup
   ```

5. **Set up Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Environment Variables for Production

Make sure to set these in your hosting platform:

```env
DATABASE_URL=your-supabase-connection-string
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Important:** 
- Update `NEXTAUTH_URL` to your production domain
- Never commit `.env` file to GitHub
- Use your hosting platform's environment variable settings

---

## Post-Deployment Checklist

- [ ] Test signup/login
- [ ] Test post creation with images
- [ ] Test notifications
- [ ] Test all major features
- [ ] Update any hardcoded URLs
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (should be automatic on most platforms)
- [ ] Set up monitoring/analytics (optional)

---

## Custom Domain Setup

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Railway/Render:
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records as instructed

---

## Cost Estimates

**Free Tier Options:**
- Vercel: Free (with limitations)
- Railway: $5/month after free trial
- Render: Free tier available
- Supabase: Free tier (500MB database)
- Cloudinary: Free tier (25GB storage)

**Total for small app:** ~$0-5/month

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Next.js Deployment: https://nextjs.org/docs/deployment