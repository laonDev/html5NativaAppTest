package com.igaming.html5app.plugin;

import com.igaming.html5app.BuildConfig;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppInfoBridge")
public class AppInfoBridgePlugin extends Plugin {

    @PluginMethod
    public void getAppInfo(PluginCall call) {
        JSObject ret = new JSObject();

        ret.put("isDebug", BuildConfig.IS_DEBUG);
        ret.put("applicationId", BuildConfig.APPLICATION_ID);
        ret.put("versionName", BuildConfig.VERSION_NAME);
        ret.put("versionCode", BuildConfig.VERSION_CODE);
        call.resolve(ret);
    }
}
