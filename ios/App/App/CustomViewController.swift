//
//  CustomViewController.swift
//  App
//
//  Created by KimSungjin on 3/24/26.
//

import Capacitor

class CustomViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        super.capacitorDidLoad()

        registPlugin()
    }
    
    func registPlugin() {
        bridge?.registerPluginInstance(StorageBridgePlugin())
        bridge?.registerPluginInstance(SecureStoragePlugin())
        bridge?.registerPluginInstance(LoggerBridgePlugin())
    }
}
