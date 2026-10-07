# Tarven Android shell — ProGuard/R8 rules.
# Release builds currently use minifyEnabled false, so these rules are
# placeholders. If you enable minification, keep WebView JS bridges intact:

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep the main activity (referenced from AndroidManifest.xml).
-keep class com.tarven.tutor.MainActivity { *; }
