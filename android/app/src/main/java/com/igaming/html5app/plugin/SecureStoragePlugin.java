package com.igaming.html5app.plugin;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SecureStorage")
public class SecureStoragePlugin extends Plugin {

    private SharedPreferences getPrefs() throws Exception {
        //MasterKey , EncryptedSharedPreferences deprecated 되었으나 이후 버전이 나오지 않아 일단 사용
        MasterKey masterKey = new MasterKey.Builder(getContext())
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build();

        return EncryptedSharedPreferences.create(
                getContext(),
                "secure_storage",
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        );
    }

    @PluginMethod
    public void setItem(PluginCall call) {
        try {
            String key = call.getString("key");
            String value = call.getString("value");

            SharedPreferences prefs = getPrefs();
            prefs.edit().putString(key, value).apply();

            Log.d("SecureStorage", "setItem: " + key);

            call.resolve();
        } catch (Exception e) {
            call.reject("setItem failed", e);
        }
    }

    @PluginMethod
    public void getItem(PluginCall call) {
        try {
            String key = call.getString("key");

            SharedPreferences prefs = getPrefs();
            String value = prefs.getString(key, "");

            JSObject ret = new JSObject();
            ret.put("value", value);

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("getItem failed", e);
        }
    }

    @PluginMethod
    public void removeItem(PluginCall call) {
        try {
            String key = call.getString("key");

            SharedPreferences prefs = getPrefs();
            prefs.edit().remove(key).apply();

            call.resolve();
        } catch (Exception e) {
            call.reject("removeItem failed", e);
        }
    }
}