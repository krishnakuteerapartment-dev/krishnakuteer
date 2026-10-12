package krishna.kuteer.apartment;

import android.content.Context;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/* Printing for the Krishna Kuteer app.
   Android's built-in browser ignores the website's window.print(), so the website calls this plugin instead
   (see printHTML in src/components/print.js). It opens Android's own print screen: pick a printer or "Save as PDF".
   When the print screen closes, the website is told ("afterprint") so it puts the normal page back. */
@CapacitorPlugin(name = "KKPrint")
public class KKPrintPlugin extends Plugin {

    @PluginMethod
    public void print(final PluginCall call) {
        final String title = call.getString("title", "Krishna Kuteer");
        final boolean landscape = Boolean.TRUE.equals(call.getBoolean("landscape", false));
        getActivity().runOnUiThread(() -> {
            try {
                final WebView web = getBridge().getWebView();
                final PrintDocumentAdapter page = web.createPrintDocumentAdapter(title);
                PrintDocumentAdapter adapter = new PrintDocumentAdapter() {
                    @Override public void onStart() { page.onStart(); }
                    @Override public void onLayout(PrintAttributes oldAttr, PrintAttributes newAttr, CancellationSignal cancel, LayoutResultCallback cb, Bundle extras) { page.onLayout(oldAttr, newAttr, cancel, cb, extras); }
                    @Override public void onWrite(PageRange[] pages, ParcelFileDescriptor out, CancellationSignal cancel, WriteResultCallback cb) { page.onWrite(pages, out, cancel, cb); }
                    @Override public void onFinish() {
                        page.onFinish();
                        web.evaluateJavascript("dispatchEvent(new Event('afterprint'))", null);
                    }
                };
                PrintAttributes attrs = new PrintAttributes.Builder()
                        .setMediaSize(landscape ? PrintAttributes.MediaSize.ISO_A4.asLandscape() : PrintAttributes.MediaSize.ISO_A4)
                        .build();
                PrintManager pm = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                pm.print(title, adapter, attrs);
                call.resolve();
            } catch (Exception e) {
                call.reject("Could not open the print screen", e);
            }
        });
    }
}
