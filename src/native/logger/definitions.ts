export interface LoggerBridgePlugin {
  log(options: { message: string }): Promise<void>
  error(options: { message: string }): Promise<void>
}