import { Layer } from "effect";
import { AppConfig } from "./AppConfig.js";
import { RpcClient } from "./RpcClient.js";
import { TokenFileSystem } from "./TokenFileSystem.js";

export { AppConfig } from "./AppConfig.js";
export { RpcClient } from "./RpcClient.js";
export { TokenFileSystem } from "./TokenFileSystem.js";

export const AppLive = Layer.mergeAll(TokenFileSystem.Default, AppConfig.Default);

export const FullLive = Layer.mergeAll(AppLive, RpcClient.Default);
