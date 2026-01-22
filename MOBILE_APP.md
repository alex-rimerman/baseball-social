# 📱 Mobile App Setup Guide

Your Baseball Social app can work as a mobile app in several ways. Here are your options:

## Option 1: Progressive Web App (PWA) - Easiest ✅

**What it is:** Your web app becomes installable on mobile devices. Users can "Add to Home Screen" and it works like a native app.

**Pros:**
- ✅ No app store approval needed
- ✅ Works on iOS and Android
- ✅ Single codebase (your existing Next.js app)
- ✅ Easy updates (just deploy)
- ✅ Free

**Cons:**
- ⚠️ Limited access to some native features
- ⚠️ Not in app stores (but installable)

**Status:** Already set up! Your app is now a PWA.

**How users install it:**
- **iOS:** Safari → Share → Add to Home Screen
- **Android:** Chrome → Menu → Install App / Add to Home Screen

---

## Option 2: Full Native App with Capacitor

**What it is:** Wrap your Next.js app as a true native app using Capacitor.

**Pros:**
- ✅ Can publish to App Store and Google Play
- ✅ Access to native device features
- ✅ Better performance
- ✅ Still uses your existing codebase

**Cons:**
- ⚠️ Requires app store approval
- ⚠️ More setup needed
- ⚠️ App store fees ($99/year for Apple, $25 one-time for Google)

### Setup Steps:

1. **Install Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npm install @capacitor/ios @capacitor/android
   ```

2. **Initialize Capacitor**
   ```bash
   npx cap init
   # App name: Baseball Social
   # App ID: com.baseballsocial.app
   # Web dir: .next
   ```

3. **Build your Next.js app**
   ```bash
   npm run build
   ```

4. **Add platforms**
   ```bash
   npx cap add ios
   npx cap add android
   ```

5. **Sync**
   ```bash
   npx cap sync
   ```

6. **Open in native IDEs**
   ```bash
   npx cap open ios      # Opens Xcode
   npx cap open android  # Opens Android Studio
   ```

7. **Build and publish**
   - iOS: Build in Xcode, submit to App Store
   - Android: Build in Android Studio, submit to Google Play

---

## Option 3: React Native (Separate Codebase)

**What it is:** Build a completely separate native app using React Native.

**Pros:**
- ✅ True native performance
- ✅ Full access to device features
- ✅ Can share some code/logic

**Cons:**
- ⚠️ Separate codebase to maintain
- ⚠️ More development time
- ⚠️ Need to learn React Native

**Not recommended** unless you need specific native features that PWA/Capacitor can't provide.

---

## Recommended: Start with PWA

Your app is already set up as a PWA! Here's what you need to do:

### 1. Add App Icons

Create these icon files in the `public` folder:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

You can use a tool like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 2. Test PWA Installation

1. Deploy your app (see DEPLOYMENT.md)
2. Open on mobile device
3. **iOS:** Safari → Share → Add to Home Screen
4. **Android:** Chrome → Menu → Install App

### 3. Enhance PWA Features (Optional)

Install `next-pwa` for offline support and better caching:

```bash
npm install next-pwa
```

Then update `next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // your existing config
})
```

---

## Mobile App Features Already Working

✅ Responsive design (works on mobile)
✅ Touch-friendly UI
✅ Mobile navigation
✅ Image/video uploads
✅ All social features
✅ Installable as PWA

---

## Publishing to App Stores (If Using Capacitor)

### Apple App Store:
1. Create Apple Developer account ($99/year)
2. Build app in Xcode
3. Archive and upload
4. Submit for review (takes 1-7 days)

### Google Play Store:
1. Create Google Play Developer account ($25 one-time)
2. Build APK/AAB in Android Studio
3. Upload to Play Console
4. Submit for review (takes 1-3 days)

---

## Quick Start: PWA (Recommended)

1. **Add icons** (see above)
2. **Deploy your app** (see DEPLOYMENT.md)
3. **Test on mobile** - open in browser, then "Add to Home Screen"
4. **Done!** Your app is now installable on mobile devices

No app store needed! Users can install it directly from the browser.

---

## Need Help?

- PWA Guide: https://web.dev/progressive-web-apps/
- Capacitor Docs: https://capacitorjs.com/docs
- Next.js PWA: https://github.com/shadowwalker/next-pwa