package com.unionpark.deliveryboard;

import android.app.Activity;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;

public class MainActivity extends Activity {

    private static final String APP_URL = "https://union-park-scheduled-deliveries.vercel.app";
    private WebView webView;
    private TextView errorView;
    private Handler handler;
    private Runnable retryRunnable;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen on — this is a kiosk/dashboard display
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Hide system UI for true fullscreen
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

        // Root layout
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0f172a"));

        // Error/offline message
        errorView = new TextView(this);
        errorView.setText("Connecting to Union Park Delivery Board...\nCheck network connection.");
        errorView.setTextColor(Color.WHITE);
        errorView.setTextSize(24);
        errorView.setGravity(android.view.Gravity.CENTER);
        errorView.setVisibility(View.GONE);
        errorView.setBackgroundColor(Color.parseColor("#0f172a"));

        // WebView
        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUserAgentString(settings.getUserAgentString() + " UnionParkFireTV/1.0");

        webView.setBackgroundColor(Color.parseColor("#0f172a"));
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                errorView.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
                // Auto-click TV Mode button after page loads
                webView.evaluateJavascript(
                    "setTimeout(function() {" +
                    "  var btn = document.querySelector('[data-view=\"tv\"]') || " +
                    "    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('TV Mode'));" +
                    "  if (btn) btn.click();" +
                    "}, 1500);",
                    null
                );
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                webView.setVisibility(View.GONE);
                errorView.setVisibility(View.VISIBLE);
                scheduleRetry();
            }
        });

        root.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));
        root.addView(errorView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        setContentView(root);

        handler = new Handler(Looper.getMainLooper());
        loadApp();
    }

    private void loadApp() {
        if (isNetworkAvailable()) {
            errorView.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            webView.loadUrl(APP_URL);
        } else {
            webView.setVisibility(View.GONE);
            errorView.setVisibility(View.VISIBLE);
            scheduleRetry();
        }
    }

    private void scheduleRetry() {
        if (retryRunnable != null) handler.removeCallbacks(retryRunnable);
        retryRunnable = () -> loadApp();
        handler.postDelayed(retryRunnable, 10000); // Retry every 10 seconds
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
        NetworkInfo info = cm != null ? cm.getActiveNetworkInfo() : null;
        return info != null && info.isConnected();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Let the D-pad and select button work in the WebView
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (webView.canGoBack()) {
                webView.goBack();
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
        // Re-hide system UI
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onDestroy() {
        if (retryRunnable != null) handler.removeCallbacks(retryRunnable);
        webView.destroy();
        super.onDestroy();
    }
}
