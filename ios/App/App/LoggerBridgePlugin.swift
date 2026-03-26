//
//  LoggerBridgePlugin.swift
//  App
//
//  Created by KimSungjin on 3/25/26.
//

import Foundation
import Capacitor

@objc(LoggerBridge)
public class LoggerBridge: CAPPlugin {

    @objc func log(_ call: CAPPluginCall) {
        let message = call.getString("message") ?? ""
        NSLog("[LoggerBridge] %@", message)
        call.resolve()
    }

    @objc func error(_ call: CAPPluginCall) {
        let message = call.getString("message") ?? ""
        NSLog("[LoggerBridge][ERROR] %@", message)
        call.resolve()
    }
}
