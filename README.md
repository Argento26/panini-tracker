# The Sticker · WC 2026 Tracker — Deployment Guide

Get your tracker app running on your iPhone home screen in about 30 minutes. No app store, no fees, no Mac required.

## What you'll do

1. **Set up Firebase** (free) — for sharing groups across devices. ~10 min
2. **Deploy to Vercel** (free) — gives you a real URL like `panini-tracker.vercel.app`. ~10 min
3. **Add to iPhone home screen** — opens like a native app. ~1 min

---

## Step 1 — Set up Firebase

Firebase is Google's free database service. We need it for the group/trade-board features. Your private collection stays in the browser.

1. Go to **https://console.firebase.google.com** and sign in with a Google account.
2. Click **"Add project"** → name it anything (e.g. `panini-tracker`) → continue → disable Google Analytics (not needed) → **Create project**.
3. Once it's ready, click **Build → Realtime Database** in the left sidebar.
4. Click **Create Database** → pick the **United States** location → choose **"Start in test mode"** → Enable.
   - Test mode lets anyone with your config read/write. That's fine for a sticker tracker among friends. We'll lock it down a bit at the end.
5. Now we need the config keys. Click the ⚙ gear icon top-left → **Project settings**.
6. Scroll down to **"Your apps"** → click the `</>` (web) icon.
7. Register the app — name it `panini-tracker-web` → don't check Firebase Hosting → Register app.
8. You'll see a `firebaseConfig` object on screen. **Keep this tab open** — you'll need these values in Step 2.

It looks like:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "panini-tracker.firebaseapp.com",
  databaseURL: "https://panini-tracker-default-rtdb.firebaseio.com",
  projectId: "panini-tracker",
  // ...other fields
};
```

You only need four values: `apiKey`, `authDomain`, `databaseURL`, `projectId`.

---

## Step 2 — Deploy to Vercel

1. Create a free account at **https://github.com** if you don't have one.
2. Create a new public repo called `panini-tracker` (no README, no .gitignore — empty).
3. On your computer, open a terminal in the folder containing this project, then:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/panini-tracker.git
git push -u origin main
```

4. Go to **https://vercel.com** → sign in with GitHub.
5. Click **"Add New → Project"** → import your `panini-tracker` repo.
6. **Important**: Before clicking Deploy, expand **"Environment Variables"** and add these four (paste the values from your Firebase config tab):

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | (your apiKey) |
| `VITE_FIREBASE_AUTH_DOMAIN` | (your authDomain) |
| `VITE_FIREBASE_DATABASE_URL` | (your databaseURL) |
| `VITE_FIREBASE_PROJECT_ID` | (your projectId) |

7. Click **Deploy**. Wait ~1 minute. You'll get a URL like `panini-tracker-abc123.vercel.app`.

---

## Step 3 — Add to iPhone

1. Open Safari on your iPhone (must be Safari, not Chrome — only Safari supports home screen apps on iOS).
2. Go to your Vercel URL.
3. Tap the **Share** button (square with up arrow) → scroll down → **Add to Home Screen**.
4. Name it "The Sticker" → Add.

You'll get an icon on your home screen that opens the app full-screen, no Safari chrome. Share the URL with friends — they do the same thing on their phones, and once everyone enters the same group code, you're all on the shared trade board.

---

## Optional: Lock down Firebase rules

Test mode expires after 30 days and is wide open. To keep it working, open Firebase Console → Realtime Database → **Rules** tab and paste this:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

This is still permissive (anyone with the database URL can read/write) but won't expire. Good enough for a sticker tracker. If you want stronger privacy later, ask Claude about adding Firebase Authentication.

---

## Updating the app

Whenever you change something in the code:

```bash
git add .
git commit -m "what changed"
git push
```

Vercel auto-deploys within a minute. Your iPhone home screen icon will load the new version on next open.

---

## Troubleshooting

- **"Group sharing is disabled" message**: your Firebase env vars aren't set in Vercel. Project Settings → Environment Variables → re-check the four `VITE_FIREBASE_*` names match exactly.
- **iPhone shows a browser bar instead of full-screen app**: you opened it from Chrome or another browser. Must be Safari, must be tapped from the home screen icon.
- **Friend's collection isn't showing up**: confirm they entered the *exact same* group code (case is normalized, but check for typos). Pull-to-refresh on iOS doesn't trigger anything; just close and reopen the app.
