<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Nuvvo - Premium Food Delivery Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-kola2252%2FNuvvo-orange.svg)](https://github.com/kola2252/Nuvvo)

**Repository:** [kola2252/Nuvvo](https://github.com/kola2252/Nuvvo)

Nuvvo is a modern food ordering and delivery ecosystem featuring live order tracking, Google Maps route visualization, role-based dashboards (Customer, Partner/Restaurant, Courier/Rider, Super Admin), smart recommendations, and an instant checkout flow with zero packaging fees.

View your app in AI Studio: https://ai.studio/apps/507af0d3-8bec-40f4-bc05-8f664c5765cf

## Features

- ⚡ **Instant Search & Recent Queries**: Fast live search across 200+ dishes, cuisines, and partner kitchens, with one-tap recent search query history.
- 🛍️ **Cart & Zero Packaging Fees**: Transparent billing with 100% free packaging.
- 📍 **Real-time Map Delivery Tracking**: Interactive delivery route tracking with partner vehicle simulation.
- 📱 **Multi-Role Portals**: Customer portal, Merchant kitchen management, Rider delivery console, and Admin control tower.

## Android App & APK Generation

Nuvvo is configured as a native-compliant Progressive Web App with Web App Manifest, 512px maskable icons, and service worker offline caching. You have three ways to run Nuvvo on Android:

### Option 1: Instant Native WebAPK (Direct on Android Phone)
1. Open Nuvvo in **Google Chrome** or **Samsung Internet** on your Android device.
2. Tap the in-app **"Install Nuvvo on Android"** banner or tap browser menu (⋮) -> **"Install app"** / **"Add to Home Screen"**.
3. Android natively packages and signs the app as a **WebAPK** with full OS integration, app launcher icon, standalone window, and offline support.

### Option 2: 1-Click APK Download via PWABuilder
1. Go to [PWABuilder](https://www.pwabuilder.com/) (Google & Microsoft PWA packaging service).
2. Enter your live deployment URL (e.g. `https://ais-pre-7hutzjogxdbtzmwgwpacnm-343969814096.asia-southeast1.run.app`).
3. Click **"Package for Stores"** -> Select **"Android"**.
4. Download the signed **`.apk`** or **`.aab`** file for direct side-loading or Google Play Store release.

### Option 3: Compile Raw APK with Capacitor & Android Studio
```bash
# 1. Install Capacitor packages
npm install -D @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor
npx cap init Nuvvo com.nuvvo.app --web-dir dist

# 3. Build project & add Android platform
npm run build
npx cap add android
npx cap sync android

# 4. Open in Android Studio & export APK
npx cap open android
# In Android Studio: Build -> Build Bundle(s) / APK(s) -> Build APK(s)
```

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
