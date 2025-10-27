import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TokenList } from "@uniswap/token-lists";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, "../../package.json"), "utf-8"));
const { version } = packageJson;

export default function buildList(): TokenList {
  const parsed = version.split(".");

  // Dynamically load all token list files
  const tokenListDir = join(__dirname, "../../token-list/evm");
  const chainFiles = readdirSync(tokenListDir).filter((f) => f.endsWith(".json"));

  const tokens = chainFiles
    .flatMap((file) => {
      const filePath = join(tokenListDir, file);
      return JSON.parse(readFileSync(filePath, "utf-8"));
    })
    .sort((t1, t2) => {
      if (t1.chainId === t2.chainId) {
        return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
      }
      return t1.chainId < t2.chainId ? -1 : 1;
    });

  // biome-ignore assist/source/useSortedKeys: order matters for generated JSON
  const list: TokenList = {
    name: "Sablier EVM Token List",
    logoURI: "https://files.sablier.com/icon-180x180.png",
    keywords: ["sablier", "default"],
    timestamp: new Date().toISOString(),
    tags: {},
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
    tokens,
  };

  return list;
}
