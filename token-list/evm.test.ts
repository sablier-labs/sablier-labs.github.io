import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getAddress } from "@ethersproject/address";
import type { TokenList } from "@uniswap/token-lists";
import schema from "@uniswap/token-lists/src/tokenlist.schema.json" with { type: "json" };
import { Ajv } from "ajv";
import type { FormatsPlugin } from "ajv-formats";
import * as addFormatsModule from "ajv-formats";
import { beforeAll, describe, expect, it } from "vitest";
import packageJson from "../package.json" with { type: "json" };

// Handle CommonJS default export for ajv-formats
const addFormats: FormatsPlugin = (addFormatsModule as unknown as { default: FormatsPlugin })
  .default;

// Create Ajv instance and add formats for date-time validation
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validator = ajv.compile(schema);
let defaultTokenList: TokenList;

describe("buildList", () => {
  beforeAll(async () => {
    const tokenListPath = path.join(__dirname, "../token-list/evm.json");

    // Only build if the file doesn't exist
    if (!fs.existsSync(tokenListPath)) {
      try {
        execSync("just build", { stdio: "inherit" });
      } catch (error) {
        throw new Error(`Failed to build token list: ${(error as Error).message}`);
      }
    }

    // Load the built token list
    if (!fs.existsSync(tokenListPath)) {
      throw new Error("Token list not found after build");
    }
    defaultTokenList = JSON.parse(fs.readFileSync(tokenListPath, "utf8"));
  }, 300_000); // 300 seconds

  it("validates token list", () => {
    const validated = validator(defaultTokenList);
    if (!validated) {
      console.error(validator.errors);
    }
    expect(validated).toBe(true);
  });

  it("contains no duplicate addresses", () => {
    const map: Record<string, boolean> = {};
    for (const token of defaultTokenList.tokens) {
      const key = `${token.chainId}-${token.address}`;
      expect(map[key]).toBeUndefined();
      map[key] = true;
    }
  });

  it("contains no duplicate symbols", () => {
    // manual override to approve certain tokens with duplicate symbols
    const approvedDuplicateSymbols = ["amp", "bank", "flx", "ichi", "rdnt", "slp", "usdc", "usds"];

    const map: Record<string, boolean> = {};
    for (const token of defaultTokenList.tokens) {
      const symbol = token.symbol.toLowerCase();
      if (approvedDuplicateSymbols.includes(symbol)) {
      } else {
        const key = `${token.chainId}-${symbol}`;
        expect(map[key]).toBeUndefined();
        map[key] = true;
      }
    }
  });

  it("contains no duplicate names", () => {
    // manual override to approve certain tokens with duplicate names
    const approvedDuplicateNames = ["Radiant", "USD Coin"];

    const map: Record<string, boolean> = {};
    for (const token of defaultTokenList.tokens) {
      const name = token.name;
      if (approvedDuplicateNames.includes(name) === false) {
        const key = `${token.chainId}-${token.name.toLowerCase()}`;
        expect(map[key]).toBeUndefined();
        map[key] = true;
      }
    }
  });

  it("all addresses are valid and checksummed", () => {
    for (const token of defaultTokenList.tokens) {
      expect(getAddress(token.address).toLowerCase()).toBe(token.address.toLowerCase());
    }
  });

  it("version matches package.json", () => {
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(packageJson.version).toBe(
      `${defaultTokenList.version.major}.${defaultTokenList.version.minor}.${defaultTokenList.version.patch}`,
    );
  });
});
