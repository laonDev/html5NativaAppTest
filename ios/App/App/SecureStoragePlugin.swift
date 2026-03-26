//
//  SecureStoragePlugin.swift
//  App
//
//  Created by KimSungjin on 3/25/26.
//

import Foundation
import Capacitor
import Security

@objc(SecureStorage)
public class SecureStoragePlugin: CAPPlugin {

    func save(key: String, value: String) {
        let data = value.data(using: .utf8)!

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    func load(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        SecItemCopyMatching(query as CFDictionary, &result)

        if let data = result as? Data {
            return String(data: data, encoding: .utf8)
        }
        return nil
    }

    func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }

    @objc func setItem(_ call: CAPPluginCall) {
        let key = call.getString("key") ?? ""
        let value = call.getString("value") ?? ""

        save(key: key, value: value)
        call.resolve()
    }

    @objc func getItem(_ call: CAPPluginCall) {
        let key = call.getString("key") ?? ""

        let value = load(key: key) ?? ""

        call.resolve([
            "value": value
        ])
    }

    @objc func removeItem(_ call: CAPPluginCall) {
        let key = call.getString("key") ?? ""

        delete(key: key)
        call.resolve()
    }
}
