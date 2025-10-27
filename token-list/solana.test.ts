import { PublicKey } from "@solana/web3.js";
import type { TokenInfo } from "@uniswap/token-lists";
import { describe, expect, it } from "vitest";
import packageJson from "../package.json" with { type: "json" };
import buildList from "../scripts/token-list/build-solana.js";

// Extend TokenInfo to include Solana-specific fields
interface SolanaTokenInfo extends TokenInfo {
  cluster: string;
  program: string;
}

describe("Solana Token List", () => {
  const tokenList = buildList();

  it("version matches package.json", () => {
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(packageJson.version).toBe(
      `${tokenList.version.major}.${tokenList.version.minor}.${tokenList.version.patch}`,
    );
  });

  it("has correct metadata", () => {
    expect(tokenList.name).toBe("Sablier Solana Token List");
    expect(tokenList.logoURI).toBe("https://files.sablier.com/icon-180x180.png");
    expect(tokenList.keywords).toContain("sablier");
    expect(tokenList.keywords).toContain("solana");
  });

  it("contains no duplicate addresses per cluster", () => {
    const map = new Map<string, boolean>();
    for (const token of tokenList.tokens) {
      const solanaToken = token as SolanaTokenInfo;
      const key = `${solanaToken.cluster}-${token.address}`;
      expect(map.has(key), `Duplicate token found: ${key}`).toBe(false);
      map.set(key, true);
    }
  });

  it("all addresses are valid Solana addresses", () => {
    for (const token of tokenList.tokens) {
      expect(() => {
        new PublicKey(token.address);
      }, `Invalid Solana address: ${token.address}`).not.toThrow();
    }
  });

  it("tokens are sorted by cluster then symbol", () => {
    for (let i = 1; i < tokenList.tokens.length; i++) {
      const prev = tokenList.tokens[i - 1] as SolanaTokenInfo;
      const curr = tokenList.tokens[i] as SolanaTokenInfo;

      const prevCluster = prev.cluster;
      const currCluster = curr.cluster;

      if (prevCluster === currCluster) {
        expect(
          prev.symbol.toLowerCase() <= curr.symbol.toLowerCase(),
          `Tokens not sorted correctly: ${prev.symbol} should come before ${curr.symbol}`,
        ).toBe(true);
      } else {
        expect(
          prevCluster.localeCompare(currCluster),
          `Clusters not sorted correctly: ${prevCluster} should come before ${currCluster}`,
        ).toBeLessThan(0);
      }
    }
  });
});
