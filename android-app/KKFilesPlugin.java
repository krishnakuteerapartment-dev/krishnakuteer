package krishna.kuteer.apartment;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/* Saving files for the Krishna Kuteer app (Word letters, CSV / Excel, photos, PDFs).
   Android's built-in browser cannot download files made by the website, so the website calls this plugin instead
   (see saveFile in src/components/print.js). The file goes to Downloads/Krishna Kuteer and Android then offers
   to open it (Word, Google Docs, WPS, a PDF reader...). */
@CapacitorPlugin(name = "KKFiles")
public class KKFilesPlugin extends Plugin {

    @PluginMethod
    public void save(final PluginCall call) {
        final String name = call.getString("name", "file").replaceAll("[\\\\/:*?\"<>|]+", "-");
        final String mime = call.getString("mime", "application/octet-stream");
        final String data = call.getString("data");
        if (data == null || data.isEmpty()) { call.reject("No file to save"); return; }
        try {
            final byte[] bytes = Base64.decode(data, Base64.DEFAULT);
            final Context ctx = getContext();
            Uri uri;
            if (Build.VERSION.SDK_INT >= 29) {
                ContentResolver cr = ctx.getContentResolver();
                ContentValues v = new ContentValues();
                v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                v.put(MediaStore.Downloads.MIME_TYPE, mime);
                v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Krishna Kuteer");
                v.put(MediaStore.Downloads.IS_PENDING, 1);
                uri = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri == null) throw new Exception("Downloads not available");
                try (OutputStream os = cr.openOutputStream(uri)) { os.write(bytes); }
                v.clear();
                v.put(MediaStore.Downloads.IS_PENDING, 0);
                cr.update(uri, v, null, null);
            } else {
                File dir = ctx.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (dir != null && !dir.exists()) dir.mkdirs();
                File f = new File(dir, name);
                try (FileOutputStream os = new FileOutputStream(f)) { os.write(bytes); }
                uri = FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".fileprovider", f);
            }
            JSObject ret = new JSObject();
            ret.put("uri", uri.toString());
            try {
                Intent open = new Intent(Intent.ACTION_VIEW);
                open.setDataAndType(uri, mime);
                open.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                getActivity().startActivity(Intent.createChooser(open, name));
                ret.put("opened", true);
            } catch (Exception e) {
                ret.put("opened", false); /* saved, but no app on the phone opens this kind of file */
            }
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not save the file", e);
        }
    }
}
