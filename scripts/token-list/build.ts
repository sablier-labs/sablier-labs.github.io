import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TokenInfo, TokenList } from "@uniswap/token-lists";
import { Effect } from "effect";
import { TokenFileSystem } from "./services/TokenFileSystem.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const buildList = Effect.gen(function* () {
  const fs = yield* TokenFileSystem;

  const pkg = yield* fs.readJsonFile<{ version: string }>(join(__dirname, "../../package.json"));
  const parsed = pkg.version.split(".");

  const tokenListDir = join(__dirname, "../../token-list/evm");
  const entries = yield* fs.readDirectory(tokenListDir);
  const chainFiles = entries.filter((f) => f.endsWith(".json"));

  const tokenArrays = yield* Effect.forEach(
    chainFiles,
    (file) => fs.readTokenFile(join(tokenListDir, file)),
    {
      concurrency: "unbounded",
    },
  );

  const tokens: TokenInfo[] = tokenArrays.flat().sort((t1, t2) => {
    if (t1.chainId === t2.chainId) {
      return t1.symbol.toLowerCase().localeCompare(t2.symbol.toLowerCase());
    }
    return t1.chainId - t2.chainId;
  });

  // biome-ignore assist/source/useSortedKeys: order matters for generated JSON
  const list: TokenList = {
    name: "Sablier EVM Token List",
    logoURI: "https://files.sablier.com/icon-180x180.png",
    keywords: ["sablier", "default"],
    timestamp: new Date().toISOString(),
    tags: {},
    version: {
      major: Number(parsed[0]),
      minor: Number(parsed[1]),
      patch: Number(parsed[2]),
    },
    tokens,
  };

  return list;
});
