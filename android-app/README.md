# Android app (Capacitor) – files added to the Android Studio project

The Android app shows the live website. These files live in the Android Studio project on the PC
(`C:\krishna-app\android\app\src\main\java\krishna\kuteer\apartment\`), not on the website; they are kept here as a copy.

- `KKPrintPlugin.java` – printing. Android's built-in browser ignores the website's print command, so 🖨 buttons
  call this plugin, which opens Android's print screen (printer or Save as PDF).
- `MainActivity.java` – registers the plugin.

The first line `package krishna.kuteer.apartment;` must match the first line of the MainActivity.java already in the project.
After changing them: raise `versionCode` in `android/app/build.gradle`, then Build → Generate Signed App Bundle / APK → APK → release.
