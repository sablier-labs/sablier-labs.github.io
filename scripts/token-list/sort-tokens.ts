import { join } from "node:path";
import { NodeRuntime } from "@effect/platform-node";
import type { TokenInfo, TokenList } from "@uniswap/token-lists";
import { Array as Arr, Console, Effect, Order } from "effect";
import { TokenFileSystem } from "./services/TokenFileSystem.js";
import type { SolanaToken } from "./types.js";

const TOKENS_DIR = "token-list";

const EvmTokenOrder = Order.combineAll<TokenInfo>([
  Order.mapInput(Order.number, (t) => t.chainId),
  Order.mapInput(Order.string, (t) => t.symbol.toLowerCase()),
]);

const SolanaTokenOrder = Order.combineAll<SolanaToken>([
  Order.mapInput(Order.string, (t) => t.cluster),
  Order.mapInput(Order.string, (t) => t.symbol.toLowerCase()),
]);

/** Sort generated token list files (evm.json, solana.json) */
const sortGeneratedFile = (filePath: string, isSolana: boolean) =>
  Effect.gen(function* () {
    const fs = yield* TokenFileSystem;
    const tokenList = yield* fs.readJsonFile<TokenList>(filePath);

    const sortedTokens = isSolana
      ? Arr.sort(tokenList.tokens as SolanaToken[], SolanaTokenOrder)
      : Arr.sort(tokenList.tokens, EvmTokenOrder);

    const updatedList = { ...tokenList, tokens: sortedTokens };
    const jsonContent = JSON.stringify(updatedList, null, 2) + "\n";
    yield* fs.writeFile(filePath, jsonContent);

    return sortedTokens.length;
  });

/** Sort source token files (evm/*.json, solana/*.json) */
const sortSourceFile = (filePath: string, isSolana: boolean) =>
  Effect.gen(function* () {
    const fs = yield* TokenFileSystem;
    const tokens = yield* fs.readJsonFile<TokenInfo[] | SolanaToken[]>(filePath);

    const sortedTokens = isSolana
      ? Arr.sort(tokens as SolanaToken[], SolanaTokenOrder)
      : Arr.sort(tokens as TokenInfo[], EvmTokenOrder);

    const jsonContent = JSON.stringify(sortedTokens, null, 2) + "\n";
    yield* fs.writeFile(filePath, jsonContent);

    return sortedTokens.length;
  });

const program = Effect.gen(function* () {
  const fs = yield* TokenFileSystem;

  // Sort source files in evm/ and solana/ directories
  const sourceCounts = yield* Effect.forEach(["evm", "solana"] as const, (subdir) =>
    Effect.gen(function* () {
      const dirPath = join(TOKENS_DIR, subdir);
      const files = yield* fs.readDirectory(dirPath);
      const jsonFiles = files.filter((f) => f.endsWith(".json"));
      const isSolana = subdir === "solana";

      yield* Effect.forEach(jsonFiles, (file) =>
        Effect.gen(function* () {
          const filePath = join(dirPath, file);
          const count = yield* sortSourceFile(filePath, isSolana);
          yield* Console.log(`✓ Sorted ${count} tokens in ${subdir}/${file}`);
        }),
      );

      return jsonFiles.length;
    }),
  );

  // Sort generated files in token-list/
  const files = yield* fs.readDirectory(TOKENS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  yield* Effect.forEach(jsonFiles, (file) =>
    Effect.gen(function* () {
      const filePath = join(TOKENS_DIR, file);
      const isSolana = file.includes("solana");
      const count = yield* sortGeneratedFile(filePath, isSolana);
      yield* Console.log(`✓ Sorted ${count} tokens in ${file}`);
    }),
  );

  const totalFiles = Arr.reduce(sourceCounts, 0, (acc, n) => acc + n) + jsonFiles.length;
  yield* Console.log(`\n✓ All ${totalFiles} files sorted successfully`);
}).pipe(Effect.provide(TokenFileSystem.Default));

NodeRuntime.runMain(program);
