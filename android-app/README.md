# Android app (Capacitor) – files added to the Android Studio project

The Android app shows the live website. These files live in the Android Studio project on the PC
(`C:\krishna-app\android\app\src\main\java\krishna\kuteer\apartment\`), not on the website; they are kept here as a copy.

- `KKPrintPlugin.java` – printing. Android's built-in browser ignores the website's print command, so 🖨 buttons
  call this plugin, which opens Android's print screen (printer or Save as PDF).
- `KKFilesPlugin.java` – saving files (app version 5). Android's built-in browser cannot download files made by the website
  (Word letters, CSV / Excel, photos, PDFs), so the website calls this plugin, which saves them in Downloads/Krishna Kuteer
  and offers to open them.
- `MainActivity.java` – registers both plugins.

The first line `package krishna.kuteer.apartment;` must match the first line of the MainActivity.java already in the project.
After changing them: raise `versionCode` in `android/app/build.gradle`, then Build → Generate Signed App Bundle / APK → APK → release.
