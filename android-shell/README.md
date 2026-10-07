# Tarven — Android Shell

A minimal Android Studio project that wraps the deployed **Tarven** web app
(Next.js) in a native WebView and produces an installable APK. It is plain
**Java** (no Kotlin, no AndroidX dependencies, no custom resources), so the
shell builds in seconds and stays easy to maintain.

## How it works

| Behavior | Detail |
| --- | --- |
| Target URL | Stored in `SharedPreferences` under key `server_url` (default `https://tarven-app.example.com`) |
| First launch | A dialog asks for the server URL so the APK can be pointed at any deployment (hosted, or `http://192.168.x.x:3000` on your LAN) |
| Change URL later | Error page → **Change server URL** button |
| WebView features | JavaScript + DOM storage enabled, `WebChromeClient` with `onShowFileChooser` (PDF/TXT upload via `ACTION_GET_CONTENT`), navigation kept inside the app (non-http schemes go to the system) |
| Back button | Navigates WebView history first |
| Errors | Full-screen dark fallback page with **Retry** |
| Loading state | Dark (slate-900) background while the page loads |
| Rotation | `configChanges` in the manifest — no activity recreation |

## Project layout

```
android-shell/
├── settings.gradle                  # repos (google/mavenCentral) + include ':app'
├── build.gradle                     # AGP 8.5.2
├── gradle.properties                # androidx=true, JVM memory
├── gradle/wrapper/gradle-wrapper.properties   # Gradle 8.7 (wrapper JAR not committed)
└── app/
    ├── build.gradle                 # com.tarven.tutor, minSdk 24, target 34, Java 17
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml      # INTERNET + READ_MEDIA_IMAGES, cleartext allowed
        └── java/com/tarven/tutor/MainActivity.java
```

No `res/` folder is needed — the launcher icon uses the system drawable
`@android:drawable/sym_def_app_icon` and the theme is
`@android:style/Theme.Material.Light.NoActionBar`.

## Build with Android Studio

1. Open Android Studio → **File ▸ Open…** → select the `android-shell/` folder.
2. Let Gradle sync (AGP 8.5.2 requires JDK 17 — Android Studio bundles it).
3. **Run ▶** to install on a device/emulator, or
   **Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s)**.
   The debug APK lands in `app/build/outputs/apk/debug/app-debug.apk`.

> On first launch the app asks for your Tarven server URL. For local testing,
> run the web app (`bun run dev`) and enter `http://<your-computer-LAN-IP>:3000`.
> Cleartext HTTP is enabled in the manifest, so plain-`http` dev servers work.

## Build from the command line

```bash
cd android-shell
gradle assembleDebug --no-daemon      # needs Gradle 8.7+ and JDK 17
# or, if you have a Gradle wrapper JAR installed locally:
# ./gradlew assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`

> Note: only `gradle-wrapper.properties` is committed — the wrapper JAR is
> intentionally excluded. CI installs Gradle itself
> (see `.github/workflows/build-apk.yml`), which then builds the APK and
> attaches it to the GitHub Release whenever you push a tag like `v1.0.0`.

## Release builds

`assembleRelease` currently signs with the debug key so it "just works".
Before publishing to a store, add a proper `signingConfig` with your keystore.
