package com.igaming.html5app.plugin;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "StorageBridge")
public class StorageBridgePlugin extends Plugin {
    @PluginMethod
    public void setItem(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");

        SharedPreferences prefs = getContext().getSharedPreferences("app_storage", Context.MODE_PRIVATE);
        prefs.edit().putString(key, value).apply();

        call.resolve();
    }

    @PluginMethod
    public void getItem(PluginCall call) {
        String key = call.getString("key");

        SharedPreferences prefs = getContext().getSharedPreferences("app_storage", Context.MODE_PRIVATE);
        String value = prefs.getString(key, "");

        JSObject ret = new JSObject();
        ret.put("value", value);

        Log.d("StoragePlugin", "getItem called / key=" + key + ", value=" + value);

        call.resolve(ret);
    }

    @PluginMethod
    public void removeItem(PluginCall call) {
        String key = call.getString("key");

        SharedPreferences prefs = getContext().getSharedPreferences("app_storage", Context.MODE_PRIVATE);
        prefs.edit().remove(key).apply();

        Log.d("StoragePlugin", "removeItem called / key=" + key);

        call.resolve();
    }
}
