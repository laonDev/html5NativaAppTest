package com.igaming.html5app.plugin;

import android.content.SharedPreferences;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LoggerBridge")
public class LoggerBridgePlugin extends Plugin {

    @PluginMethod
    public void log(PluginCall call) {
            String message = call.getString("message", "");
            if (message != null) {
                Log.d("LoggerBridge", message);
            }
            call.resolve();
    }

    @PluginMethod
    public void error(PluginCall call) {
        String message = call.getString("message", "");
        if (message != null) {
            Log.d("LoggerBridge", message);
        }
        call.resolve();
    }
}