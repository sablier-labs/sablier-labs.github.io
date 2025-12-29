import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "@effect/vitest";
import type { TokenInfo } from "@uniswap/token-lists";
import { Effect } from "effect";
import { sablier } from "sablier";
import { ChainNotSupportedError, InvalidDecimalsError } from "../scripts/token-list/errors.js";
import { AppConfig, RpcClient, TokenFileSystem } from "../scripts/token-list/services/index.js";

const CHAIN_DIR = "token-list/evm";

// Load chain files at module level for it.each()
const chainFiles = readdirSync(CHAIN_DIR).filter((file) => file.endsWith(".json"));

// Map chain files to test cases with chain names and token counts
const chainTestCases = chainFiles.map((file) => {
  const chainId = Number.parseInt(file.replace(".json", ""), 10);
  const chain = sablier.chains.get(chainId);
  const filePath = join(CHAIN_DIR, file);
  const tokens: TokenInfo[] = JSON.parse(readFileSync(filePath, "utf-8"));
  return {
    chainName: chain?.name ?? `Chain ${chainId}`,
    file,
    tokenCount: tokens.length,
  };
});

const checkTokenDecimals = (token: TokenInfo, rpcUrl: string) =>
  Effect.gen(function* () {
    const rpc = yield* RpcClient;
    const actualDecimals = yield* rpc.getDecimals(rpcUrl, token.address);

    if (token.decimals !== actualDecimals) {
      return yield* Effect.fail(
        new InvalidDecimalsError({
          actual: actualDecimals,
          address: token.address,
          expected: token.decimals,
        }),
      );
    }
  });

const validateChainTokens = (file: string) =>
  Effect.gen(function* () {
    const config = yield* AppConfig;
    const fs = yield* TokenFileSystem;

    if (!config.routemeshApiKey) {
      yield* Effect.log("VITE_ROUTEMESH_API_KEY not set, skipping");
      return;
    }

    const chainId = Number.parseInt(file.replace(".json", ""), 10);
    const filePath = join(CHAIN_DIR, file);

    // Read tokens for this chain using TokenFileSystem
    const tokens = yield* fs.readJsonFile<TokenInfo[]>(filePath);

    const chain = sablier.chains.get(chainId);

    if (chainId === 369369) {
      yield* Effect.log("Routemesh endpoint not set for chain, skipping");
      //TODO
      // The system relies on all chains having a routemesh configuration. Chains like denergy don't.
      // Until this is handled here and in the SDK, we're skipping denergy.
      return;
    }

    if (!chain || !chain.rpc?.routemesh) {
      return yield* Effect.fail(
        new ChainNotSupportedError({
          chainId,
        }),
      );
    }

    // Generate RPC URL using RouteMesh
    const rpcUrl = chain.rpc.routemesh(config.routemeshApiKey);

    // Parallel token validation
    yield* Effect.forEach(tokens, (token) => checkTokenDecimals(token, rpcUrl), {
      concurrency: "unbounded",
    });
  });

describe.skipIf(process.env.CI !== "true")("Token decimals validation", () => {
  it.live.each(chainTestCases)(
    "should validate $chainName tokens ($tokenCount tokens) against on-chain data",
    ({ file }) =>
      validateChainTokens(file).pipe(
        Effect.provide(RpcClient.Default),
        Effect.provide(AppConfig.Default),
        Effect.provide(TokenFileSystem.Default),
      ),
  );
});
