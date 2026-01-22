# 🚀 Next Steps to Get Your Baseball Social App Running

Follow these steps to set up and deploy your baseball social media app:

## 📋 Prerequisites

1. **Node.js** - Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL Database** - Choose one:
   - Local PostgreSQL installation
   - [Supabase](https://supabase.com) (free tier available)
   - [Neon](https://neon.tech) (free tier available)
   - [Railway](https://railway.app) (free tier available)
   - Any PostgreSQL hosting service
3. **Cloudinary Account** - Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)

## 🔧 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory with the following:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/baseball_social?schema=public"
# Replace with your actual PostgreSQL connection string

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"
# Generate a secret: openssl rand -base64 32

# Cloudinary Configuration (from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Quick Secret Generation:**
- On Mac/Linux: `openssl rand -base64 32`
- On Windows: Use PowerShell or an online generator

### Step 3: Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push the schema to your database (creates all tables)
npm run db:push
```

**Alternative:** If you want to use migrations instead:
```bash
npx prisma migrate dev --name init
```

### Step 4: Verify Database Connection

Optional - Open Prisma Studio to view your database:
```bash
npm run db:studio
```

This opens a visual database editor at `http://localhost:5555`

### Step 5: Start Development Server

```bash
npm run dev
```

Your app will be running at [http://localhost:3000](http://localhost:3000)

## 🎯 First Steps After Setup

1. **Create Your Account**
   - Go to `/auth/signup`
   - Fill in your details
   - Sign up with email and password

2. **Complete Your Profile**
   - Click on your profile
   - Click "Edit Profile"
   - Add your favorite team, player, bio, and location

3. **Create Your First Post**
   - Click "Create" in the navigation
   - Upload an image or video
   - Write a caption with hashtags (e.g., `#Yankees #Baseball`)
   - Post it!

4. **Explore the App**
   - Check out the Home feed
   - Visit the Explore page for personalized recommendations
   - Search for users and posts in Discover
   - Save posts you like

## 🔍 Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running (if local)
- Check firewall settings if using remote database

### Cloudinary Upload Issues
- Verify your Cloudinary credentials are correct
- Check that your Cloudinary account is active
- Ensure API key has upload permissions

### Authentication Issues
- Make sure `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again
- Check that `NEXTAUTH_URL` matches your current URL

### Prisma Issues
- Run `npm run db:generate` again
- Make sure your database is accessible
- Check Prisma schema for syntax errors

## 📦 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy!

**Database for Production:**
- Use Supabase, Neon, or Railway for production PostgreSQL
- Update `DATABASE_URL` in Vercel environment variables

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add PostgreSQL database service
4. Add environment variables
5. Deploy!

### Option 3: Self-Hosted

1. Set up a VPS (DigitalOcean, AWS, etc.)
2. Install Node.js and PostgreSQL
3. Clone repository
4. Set up PM2 or similar process manager
5. Configure reverse proxy (Nginx)
6. Set up SSL certificate (Let's Encrypt)

## 🎨 Customization Ideas

1. **Colors & Branding**
   - Edit `tailwind.config.ts` to change color scheme
   - Update logo/icon in app

2. **Features**
   - Add more baseball-specific features
   - Integrate with MLB API for live scores
   - Add team-specific feeds

3. **UI/UX**
   - Customize component styles in `components/` folder
   - Add animations with Framer Motion
   - Implement dark mode

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## 🐛 Need Help?

Common issues:
- Check console logs for errors
- Verify all environment variables are set
- Ensure database migrations ran successfully
- Check that all dependencies installed correctly

## ✨ What's Next?

Once your app is running:
1. Invite users to test it
2. Gather feedback
3. Add more features
4. Customize it to your needs
5. Deploy to production

---

**Ready to go?** Start with Step 1 and you'll have your app running in minutes! 🚀⚾