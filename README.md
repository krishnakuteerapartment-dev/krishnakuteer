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
Edit files in `public/`, push to GitHub. If `index.html` or `features.js` changes, bump `V = "kk-v46"` in `public/sw.js`.

## Committee features (Assets, Reminders, Meeting, Contacts, Visitor register, Complaint tracking, Audit log)
The screens are in `public/features.js`; the rules and checks are in `apps-script/Code.gs`.

**Update the backend FIRST** (the new Code.gs also works with the old app, so phones keep working while you do this):
1. Apps Script > replace all of `Code.gs` with the new file > Save.
2. Run `setup()` once. It adds the new tabs (`assets`, `asset_service`, `reminders`, `contacts`, `action_items`, `audit_log`),
   adds new columns at the END of `complaints`, `meetings`, `visitors`, `gallery`, gives old complaints ticket numbers
   (KK-2026-0001…), and fills in the national emergency numbers 101 / 108 / 100 / 112. Safe to run again.
3. Deploy > Manage deployments > Edit > Version: **New version** > Deploy (the URL stays the same).
4. Run `testReminders` once to check the daily reminder alert (it also runs by itself from `keepWarm`, once a day after 8 AM).
Then merge the website changes; the APK picks them up on its own (no new APK needed).

**Who can do what** (change the lists at the top of Code.gs):
| | Residents | Executive | President / Secretary / Treasurer / Admin |
|---|---|---|---|
| Assets & service history | view (no costs) | view, add service records | add / edit / delete |
| Reminders | – | view, add, mark done | everything |
| Meeting records | agenda; minutes, attendance, resolutions, action items only after **Publish** | same as residents | president/secretary/admin edit; treasurer updates action items |
| Emergency contacts | view + one-tap call | view + call | add / edit / verify |
| Visitor register | totals + visitors to their own flat (no phone numbers) | record / exit / delete | see everything |
| Complaints | raise, see their own + history | – | assign, set expected date, change status; president, secretary and treasurer are alerted of each new complaint |
| Audit log | – | – | read only (nobody can edit it from the app) |

**Privacy:** a resident's phone never receives other flats' payment references/remarks/receipt numbers, other flats'
complaints, visitor names or phone numbers, Association-only documents, draft minutes, reminders or service costs.
Association-only documents and all complaint photos/voice notes are saved to the Drive folder
**"Krishna Kuteer Association Documents (private)"** — do not share that folder. Complaint photos saved earlier are still
in "Krishna Kuteer Apartment Documents/Other"; move them by hand if that folder is shared with residents.

**Tests:** `tests/` runs Code.gs on an in-memory Sheet (`node tests/backend.test.js apps-script/Code.gs`) and the real
website in a phone-sized and a desktop browser (`node tests/e2e.js . out`, needs Playwright).
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

## Visitor approval (gate)
1. Run `addWatchman()` once in Apps Script: it creates the **Watchman** sign-in and shows its starting password in View > Logs.
   The watchman signs in on the gate phone and taps **Turn on** for alerts; that login sees only Visitors and Contacts.
2. Watchman: enter the visitor and tap **Ask flat to approve**. The flat's phones get an alert with **Approve / Deny**
   (and **Leave at gate** for deliveries). The gate screen turns green or red within a few seconds.
   No answer for 3 minutes: **Call Flat** (the number the flat saved under Visitors > Phone number for the gate) or **Ask again**.
3. Residents: **Guest passes** on the Visitors page. One visit = a 6-digit code to send the guest; Always allowed = daily help.
   The gate types the code (or taps the name) and lets them in without a call.
The one-time code inside each alert is kept only in the script cache for 30 minutes, never in the Sheet.
