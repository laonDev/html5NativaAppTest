package com.igaming.html5app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.igaming.html5app.plugin.AppInfoBridgePlugin;
import com.igaming.html5app.plugin.LoggerBridgePlugin;
import com.igaming.html5app.plugin.SecureStoragePlugin;
import com.igaming.html5app.plugin.StorageBridgePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registPlugins();

        super.onCreate(savedInstanceState);
    }

    private void registPlugins() {
        registerPlugin(StorageBridgePlugin.class);
        registerPlugin(SecureStoragePlugin.class);
        registerPlugin(LoggerBridgePlugin.class);
        registerPlugin(AppInfoBridgePlugin.class);
    }
}
