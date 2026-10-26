package krishna.kuteer.apartment;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        /* the app's own plugins must be registered before super.onCreate */
        registerPlugin(KKPrintPlugin.class);
        registerPlugin(KKFilesPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
