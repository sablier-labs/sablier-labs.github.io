import { join } from "node:path";
import { NodeRuntime } from "@effect/platform-node";
import type { TokenInfo, TokenList } from "@uniswap/token-lists";
import { Console, Effect } from "effect";
import { TokenFileSystem } from "./services/TokenFileSystem.js";
import type { SolanaToken } from "./types.js";

const TOKENS_DIR = "token-list";

const sortTokenFile = (filePath: string, isSolana: boolean) =>
  Effect.gen(function* () {
    const fs = yield* TokenFileSystem;
    const tokenList = yield* fs.readJsonFile<TokenList>(filePath);

    const sortedTokens = isSolana
      ? (tokenList.tokens as SolanaToken[]).sort((a, b) => {
          if (a.cluster === b.cluster) {
            return a.symbol.toLowerCase() < b.symbol.toLowerCase() ? -1 : 1;
          }
          return a.cluster.localeCompare(b.cluster);
        })
      : tokenList.tokens.sort((a: TokenInfo, b: TokenInfo) => {
          if (a.chainId === b.chainId) {
            return a.symbol.toLowerCase().localeCompare(b.symbol.toLowerCase());
          }
          return a.chainId < b.chainId ? -1 : 1;
        });

    const updatedList = { ...tokenList, tokens: sortedTokens };
    const jsonContent = JSON.stringify(updatedList, null, 2) + "\n";
    yield* fs.writeFile(filePath, jsonContent);

    return sortedTokens.length;
  });

const program = Effect.gen(function* () {
  const fs = yield* TokenFileSystem;
  const files = yield* fs.readDirectory(TOKENS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  yield* Console.log(`Found ${jsonFiles.length} token files to sort...\n`);

  for (const file of jsonFiles) {
    const filePath = join(TOKENS_DIR, file);
    const isSolana = file.includes("solana");
    const count = yield* sortTokenFile(filePath, isSolana);
    yield* Console.log(`✓ Sorted ${count} tokens in ${file}`);
  }

  yield* Console.log(`\n✓ All ${jsonFiles.length} files sorted successfully`);
}).pipe(Effect.provide(TokenFileSystem.Default));

NodeRuntime.runMain(program);
