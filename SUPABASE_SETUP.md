# 🔗 Supabase Database Setup Guide

## Step 1: Get Your Database Connection String

1. Go to your Supabase project: https://pqfqappjazodktwjihez.supabase.co
2. Click on **Settings** (gear icon) in the left sidebar
3. Click on **Database** in the settings menu
4. Scroll down to **Connection String** section
5. Select **URI** tab (not Session mode)
6. Copy the connection string - it will look like:
   ```
   postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.pqfqappjazodktwjihez.supabase.co:5432/postgres
   ```

## Step 2: Get Your Database Password

If you don't remember your database password:
1. Go to **Settings** → **Database**
2. Look for **Database Password** section
3. If you need to reset it, click **Reset Database Password**
4. **IMPORTANT**: Save this password securely!

## Step 3: Update Your .env File

Replace the `DATABASE_URL` in your `.env` file with the connection string you copied, making sure to:
- Replace `[YOUR-PASSWORD]` with your actual database password
- Keep `?schema=public` at the end

Example:
```env
DATABASE_URL="postgresql://postgres:your-actual-password-here@db.pqfqappjazodktwjihez.supabase.co:5432/postgres?schema=public"
```

## Step 4: Generate NextAuth Secret

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in your `.env` file.

## Step 5: Set Up Cloudinary (for image/video uploads)

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Go to Dashboard
3. Copy these values to your `.env`:
   - Cloud Name
   - API Key
   - API Secret

## Step 6: Test Database Connection

After updating your `.env` file, run:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push
```

If successful, you'll see: "Your database is now in sync with your Prisma schema."

## Troubleshooting

### Connection Refused Error
- Make sure you're using the correct port (5432 for direct connection, 6543 for connection pooling)
- Check that your IP is allowed in Supabase (Settings → Database → Connection Pooling)

### Authentication Failed
- Double-check your database password
- Make sure there are no extra spaces in the connection string
- Try resetting your database password in Supabase

### Schema Error
- Make sure `?schema=public` is at the end of your DATABASE_URL
- The schema should be `public` (default for Supabase)

---

**Note**: The publishable key you shared (`sb_publishable_dFOzL6huueOfIFzOhS3GdA_5FKNrWqd`) is for Supabase client-side features. We don't need it for the database connection, but you might use it later if you add Supabase client features.