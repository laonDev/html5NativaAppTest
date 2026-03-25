//
//  StorageBridgePlugin.swift
//  App
//
//  Created by KimSungjin on 3/24/26.
//

import Foundation
import Capacitor

@objc(StorageBridgePlugin)
public class StorageBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StorageBridgePlugin"
    public let jsName = "StorageBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setItem", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getItem", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeItem", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise)
    ]

    private let storage = UserDefaults.standard

    @objc func setItem(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), !key.isEmpty else {
            call.reject("key is required")
            return
        }

        guard let value = call.getString("value") else {
            call.reject("value is required")
            return
        }

        storage.set(value, forKey: key)
        call.resolve()
    }

    @objc func getItem(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), !key.isEmpty else {
            call.reject("key is required")
            return
        }

        let value = storage.string(forKey: key)
        call.resolve([
            "value": value as Any
        ])
    }

    @objc func removeItem(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), !key.isEmpty else {
            call.reject("key is required")
            return
        }

        storage.removeObject(forKey: key)
        call.resolve()
    }

    @objc func clear(_ call: CAPPluginCall) {
        if let bundleId = Bundle.main.bundleIdentifier,
           let dictionary = UserDefaults.standard.persistentDomain(forName: bundleId) {
            for key in dictionary.keys {
                UserDefaults.standard.removeObject(forKey: key)
            }
        }
        call.resolve()
    }
}
