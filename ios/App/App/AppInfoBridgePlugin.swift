//
//  AppInfoBridgePlugin.swift
//  App
//
//  Created by KimSungjin on 3/26/26.
//

import Foundation
import Capacitor

@objc(AppInfoBridge)
public class AppInfoBridgePlugin: CAPPlugin {

    @objc func getAppInfo(_ call: CAPPluginCall) {
        var isDebug = false

        #if DEBUG
        isDebug = true
        #endif

        let info = Bundle.main.infoDictionary

        call.resolve([
            "isDebug": isDebug,
            "bundleId": Bundle.main.bundleIdentifier ?? "",
            "versionName": info?["CFBundleShortVersionString"] as? String ?? "",
            "versionCode": info?["CFBundleVersion"] as? String ?? ""
        ])
    }
}
