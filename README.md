# Krishna Kuteer Apartment – App

```
public/        <- the website (this is the ONLY folder Cloudflare publishes)
apps-script/   <- Code.gs for Google Apps Script (kept private, never published)
```

## 1. Deploy from GitHub to Cloudflare Pages
1. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git > pick this repo.
2. Build command: leave empty. Build output directory: `public`.
3. Save and Deploy. You get `https://YOUR-NAME.pages.dev`.
Every future `git push` redeploys automatically.

## 2. Make the APK with PWABuilder
1. Go to https://www.pwabuilder.com and paste your `https://YOUR-NAME.pages.dev` URL. Click Start.
2. Fix anything marked red (should be none). Click "Package for stores" > Android.
3. Use: Package ID `com.krishnakuteer.app`, App name `Krishna Kuteer`, Host = `YOUR-NAME.pages.dev`, Start URL `/`.
4. Signing key: choose "New" and let PWABuilder generate it. Download the zip.
5. From the zip, install `.apk` on phones (allow "install unknown apps"). The `.aab` is for Play Store.

## 3. Remove the browser address bar in the app (Digital Asset Links)
1. Open `signing-key-info.txt` from the PWABuilder zip and copy the SHA-256 fingerprint.
2. Replace `public/.well-known/assetlinks.json` with the `assetlinks.json` file included in that zip
   (or use the template below with your fingerprint).
3. Commit and push. Check `https://YOUR-NAME.pages.dev/.well-known/assetlinks.json` opens in a browser.
4. Reinstall the APK. The address bar will be gone.

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.krishnakuteer.app",
    "sha256_cert_fingerprints": ["PASTE:YOUR:SHA256:FINGERPRINT"]
  }
}]
```

## Keep safe
- NEVER upload the signing keystore or its password to GitHub (.gitignore already blocks them). Keep a private backup:
  if you lose it you cannot update the same app.
- Make this GitHub repo **Private**.

## Updating the site
Edit files in `public/`, push to GitHub. If `index.html` changes, bump `V = "kk-v26"` in `public/sw.js`.
The APK itself loads your live site, so website updates reach the app without a new APK.

## 4. Push notifications (alerts on every installed phone)
Phones get an alert when: a notice, meeting/event or poll is added, and after every website update you push to GitHub.

**A. Firebase (free)**
1. console.firebase.google.com > Add project (Analytics not needed).
2. Project settings > General > Your apps > Web (`</>`) > register. Copy the config values into `public/firebase-config.js`.
3. Project settings > Cloud Messaging > Web Push certificates > Generate key pair. Paste the public key as `vapidKey`.
4. Project settings > Service accounts > Generate new private key. A JSON file downloads (keep it secret; never put it in GitHub).

**B. Google Apps Script**
1. Paste the new `apps-script/Code.gs`. Run `setup()` once (creates the `push_tokens` tab).
2. Project Settings > Script properties, add:
   - `FCM_SERVICE_ACCOUNT` = the full text of the JSON file from step A4
   - `PUSH_SECRET` = any long random text
3. Run `testPush` once and click Allow. Then Deploy > Manage deployments > Edit > Version: **New version** > Deploy (the URL stays the same).

**C. GitHub**
Repo > Settings > Secrets and variables > Actions > add `SCRIPT_URL` (your Apps Script /exec URL) and `PUSH_SECRET` (same text as above).
Add `[skip notify]` to a commit message when you do NOT want users alerted.

**D. Phones**
Push the files to GitHub. Each user opens the app once and taps **Turn on** on the home screen, then Allow.
In PWABuilder > Android options, keep **Notification delegation** ON (rebuild the APK only if it was OFF).
Android and desktop Chrome are supported. iPhones only get alerts if the site is added to the Home Screen from Safari.
