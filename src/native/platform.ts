import { Capacitor } from "@capacitor/core"

export const platform = {
  isWeb: () => Capacitor.getPlatform() === "web",
  isAndroid: () => Capacitor.getPlatform() === "android",
  isIOS: () => Capacitor.getPlatform() === "ios",

  getPlatform: () => Capacitor.getPlatform(),
}