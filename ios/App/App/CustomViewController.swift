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

        bridge?.registerPluginInstance(StorageBridgePlugin())
        bridge?.registerPluginInstance(SecureStoragePlugin())
    }
}
