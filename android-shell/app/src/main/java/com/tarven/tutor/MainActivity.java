package com.tarven.tutor;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

/**
 * Tarven Android shell.
 *
 * <p>A single-activity WebView wrapper around the deployed Tarven web app
 * (Next.js). The target URL is stored in SharedPreferences under the key
 * {@code server_url}; on first launch the user is asked for it, so the same
 * APK can be pointed at any deployment (hosted, or a local dev machine on
 * the same network).</p>
 *
 * <p>Uses only framework APIs (no AndroidX / no Kotlin) to keep the shell
 * minimal — plain {@link android.app.Activity} + {@link WebView}.</p>
 */
public class MainActivity extends Activity {

    private static final String PREFS_NAME = "tarven_prefs";
    private static final String KEY_SERVER_URL = "server_url";
    private static final String DEFAULT_SERVER_URL = "https://tarven-app.example.com";

    private static final int FILE_CHOOSER_REQUEST = 4201;

    /** Slate-900: dark background shown while the page is loading. */
    private static final int LOADING_BG_COLOR = 0xFF0F172A;

    private SharedPreferences prefs;
    private WebView webView;
    private View errorView;
    private ValueCallback<Uri[]> fileUploadCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);

        // Dark background while the (Next.js) page loads.
        getWindow().setBackgroundDrawable(new ColorDrawable(LOADING_BG_COLOR));

        webView = new WebView(this);
        webView.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        webView.setBackgroundColor(LOADING_BG_COLOR);
        configureWebView();

        errorView = buildErrorView();

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(LOADING_BG_COLOR);
        root.addView(webView);
        root.addView(errorView);
        setContentView(root);

        String saved = prefs.getString(KEY_SERVER_URL, null);
        if (saved == null || saved.trim().isEmpty()) {
            promptForServerUrl(true); // first launch
        } else {
            loadServerUrl();
        }
    }

    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        // Allow http content on https pages (useful for mixed dev setups).
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();
                if ("http".equals(scheme) || "https".equals(scheme)) {
                    return false; // keep web navigation inside the app
                }
                // mailto:, tel:, whatsapp: ... hand off to the system.
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                errorView.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request,
                                        WebResourceError error) {
                if (request.isForMainFrame()) {
                    showErrorPage();
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                return launchFileChooser(callback, params);
            }
        });
    }

    // ---------------------------------------------------------------------
    // File upload (textbook PDFs / TXT)
    // ---------------------------------------------------------------------

    private boolean launchFileChooser(ValueCallback<Uri[]> callback,
                                      WebChromeClient.FileChooserParams params) {
        if (fileUploadCallback != null) {
            fileUploadCallback.onReceiveValue(null);
        }
        fileUploadCallback = callback;

        List<String> mimeTypes = collectAcceptMimeTypes(params.getAcceptTypes());

        // ACTION_GET_CONTENT with CATEGORY_OPENABLE works on every supported
        // API level and routes through the system document picker.
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        if (mimeTypes.size() == 1 && !"*/*".equals(mimeTypes.get(0))) {
            intent.setType(mimeTypes.get(0));
        } else if (mimeTypes.size() > 1) {
            intent.setType("*/*");
            intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes.toArray(new String[0]));
        } else {
            intent.setType("*/*");
        }

        try {
            startActivityForResult(Intent.createChooser(intent, "Select a file"),
                    FILE_CHOOSER_REQUEST);
            return true;
        } catch (android.content.ActivityNotFoundException e) {
            fileUploadCallback = null;
            return false;
        }
    }

    /** Maps <input accept="..."> values (mime types or .pdf/.txt) to MIME types. */
    private static List<String> collectAcceptMimeTypes(String[] acceptTypes) {
        List<String> mimes = new ArrayList<>();
        if (acceptTypes == null) {
            return mimes;
        }
        for (String raw : acceptTypes) {
            if (raw == null) {
                continue;
            }
            for (String token : raw.split(",")) {
                String t = token.trim().toLowerCase();
                if (t.isEmpty()) {
                    continue;
                }
                if (".pdf".equals(t) || t.contains("pdf")) {
                    addIfMissing(mimes, "application/pdf");
                } else if (".txt".equals(t) || t.startsWith("text/")) {
                    addIfMissing(mimes, "text/plain");
                } else if (t.startsWith("image/")) {
                    addIfMissing(mimes, "image/*");
                }
            }
        }
        return mimes;
    }

    private static void addIfMissing(List<String> list, String value) {
        if (!list.contains(value)) {
            list.add(value);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST) {
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) {
                results = new Uri[]{data.getData()};
            }
            if (fileUploadCallback != null) {
                fileUploadCallback.onReceiveValue(results);
                fileUploadCallback = null;
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    // ---------------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------------

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    // ---------------------------------------------------------------------
    // Server URL handling
    // ---------------------------------------------------------------------

    private void loadServerUrl() {
        errorView.setVisibility(View.GONE);
        String url = prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL);
        webView.loadUrl(url);
    }

    /**
     * Dialog asking for the server URL. On first launch it is not
     * cancelable so a URL always ends up in SharedPreferences.
     */
    private void promptForServerUrl(final boolean firstLaunch) {
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (20 * getResources().getDisplayMetrics().density);
        container.setPadding(pad, pad / 2, pad, 0);

        final EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setHint(DEFAULT_SERVER_URL);
        input.setText(prefs.getString(KEY_SERVER_URL, ""));
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        container.addView(input);

        AlertDialog.Builder builder = new AlertDialog.Builder(this)
                .setTitle(firstLaunch ? "Welcome to Tarven" : "Change server URL")
                .setMessage(firstLaunch
                        ? "Enter the address of your Tarven web app.\n\n"
                          + "Examples:\n"
                          + "https://tarven-app.example.com\n"
                          + "http://192.168.1.10:3000  (local dev server)"
                        : null)
                .setView(container)
                .setCancelable(!firstLaunch)
                .setPositiveButton("Save & Continue", (dialog, which) -> {
                    String url = input.getText().toString().trim();
                    if (url.isEmpty()) {
                        url = DEFAULT_SERVER_URL;
                    }
                    if (!url.startsWith("http://") && !url.startsWith("https://")) {
                        url = "https://" + url;
                    }
                    prefs.edit().putString(KEY_SERVER_URL, url).apply();
                    loadServerUrl();
                });

        if (firstLaunch) {
            builder.setNegativeButton("Use default", (dialog, which) -> {
                prefs.edit().putString(KEY_SERVER_URL, DEFAULT_SERVER_URL).apply();
                loadServerUrl();
            });
        } else {
            builder.setNegativeButton("Cancel", null);
        }
        builder.show();
    }

    // ---------------------------------------------------------------------
    // Error page fallback
    // ---------------------------------------------------------------------

    private void showErrorPage() {
        if (fileUploadCallback != null) {
            fileUploadCallback.onReceiveValue(null);
            fileUploadCallback = null;
        }
        errorView.setVisibility(View.VISIBLE);
    }

    /** Swipe-in error page with Retry + Change server URL (built in code, no res/). */
    private View buildErrorView() {
        FrameLayout overlay = new FrameLayout(this);
        overlay.setBackgroundColor(LOADING_BG_COLOR);
        overlay.setVisibility(View.GONE);

        float density = getResources().getDisplayMetrics().density;
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        int pad = (int) (32 * density);
        box.setPadding(pad, pad, pad, pad);
        overlay.addView(box, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        TextView title = new TextView(this);
        title.setText("Could not reach the server");
        title.setTextColor(Color.WHITE);
        title.setTextSize(18);
        title.setGravity(Gravity.CENTER);
        box.addView(title);

        TextView message = new TextView(this);
        message.setText("Check your internet connection and the server URL, then try again.");
        message.setTextColor(0xFF94A3B8);
        message.setTextSize(14);
        message.setGravity(Gravity.CENTER);
        message.setPadding(0, (int) (12 * density), 0, 0);
        box.addView(message);

        Button retry = new Button(this);
        retry.setText("Retry");
        retry.setOnClickListener(v -> loadServerUrl());
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        retryParams.topMargin = (int) (24 * density);
        retryParams.gravity = Gravity.CENTER_HORIZONTAL;
        box.addView(retry, retryParams);

        Button changeUrl = new Button(this);
        changeUrl.setText("Change server URL");
        changeUrl.setBackgroundColor(Color.TRANSPARENT);
        changeUrl.setTextColor(0xFF60A5FA);
        changeUrl.setOnClickListener(v -> promptForServerUrl(false));
        LinearLayout.LayoutParams changeParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        changeParams.topMargin = (int) (8 * density);
        changeParams.gravity = Gravity.CENTER_HORIZONTAL;
        box.addView(changeUrl, changeParams);

        return overlay;
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
