import { join } from "node:path";
import { NodeRuntime } from "@effect/platform-node";
import type { TokenInfo, TokenList } from "@uniswap/token-lists";
import { Console, Effect } from "effect";
import { TokenFileSystem } from "./services/TokenFileSystem.js";
import type { SolanaToken } from "./types.js";

const TOKENS_DIR = "token-list";

const sortEvmTokens = (tokens: TokenInfo[]): TokenInfo[] =>
  tokens.sort((a, b) => {
    if (a.chainId === b.chainId) {
      return a.symbol.toLowerCase().localeCompare(b.symbol.toLowerCase());
    }
    return a.chainId < b.chainId ? -1 : 1;
  });

const sortSolanaTokens = (tokens: SolanaToken[]): SolanaToken[] =>
  tokens.sort((a, b) => {
    if (a.cluster === b.cluster) {
      return a.symbol.toLowerCase().localeCompare(b.symbol.toLowerCase());
    }
    return a.cluster.localeCompare(b.cluster);
  });

/** Sort generated token list files (evm.json, solana.json) */
const sortGeneratedFile = (filePath: string, isSolana: boolean) =>
  Effect.gen(function* () {
    const fs = yield* TokenFileSystem;
    const tokenList = yield* fs.readJsonFile<TokenList>(filePath);

    const sortedTokens = isSolana
      ? sortSolanaTokens(tokenList.tokens as SolanaToken[])
      : sortEvmTokens(tokenList.tokens);

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
      ? sortSolanaTokens(tokens as SolanaToken[])
      : sortEvmTokens(tokens as TokenInfo[]);

    const jsonContent = JSON.stringify(sortedTokens, null, 2) + "\n";
    yield* fs.writeFile(filePath, jsonContent);

    return sortedTokens.length;
  });

const program = Effect.gen(function* () {
  const fs = yield* TokenFileSystem;
  let totalFiles = 0;

  // Sort source files in evm/ and solana/ directories
  for (const subdir of ["evm", "solana"]) {
    const dirPath = join(TOKENS_DIR, subdir);
    const files = yield* fs.readDirectory(dirPath);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const isSolana = subdir === "solana";

    for (const file of jsonFiles) {
      const filePath = join(dirPath, file);
      const count = yield* sortSourceFile(filePath, isSolana);
      yield* Console.log(`✓ Sorted ${count} tokens in ${subdir}/${file}`);
      totalFiles++;
    }
  }

  // Sort generated files in token-list/
  const files = yield* fs.readDirectory(TOKENS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  for (const file of jsonFiles) {
    const filePath = join(TOKENS_DIR, file);
    const isSolana = file.includes("solana");
    const count = yield* sortGeneratedFile(filePath, isSolana);
    yield* Console.log(`✓ Sorted ${count} tokens in ${file}`);
    totalFiles++;
  }

  yield* Console.log(`\n✓ All ${totalFiles} files sorted successfully`);
}).pipe(Effect.provide(TokenFileSystem.Default));

NodeRuntime.runMain(program);
