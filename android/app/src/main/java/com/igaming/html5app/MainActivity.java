package com.igaming.html5app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.igaming.html5app.plugin.StorageBridgePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(StorageBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
