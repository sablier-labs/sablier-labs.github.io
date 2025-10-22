import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { TokenInfo } from "@uniswap/token-lists";
import axios from "axios";
import { config } from "dotenv";
import { describe, expect, it } from "vitest";

// Load environment variables from .env file
config();

const TOKENS_DIR = "token-list";

async function checkTokenDecimals(token: TokenInfo, rpcUrl: string): Promise<void> {
  const { address, decimals: tokenDecimal } = token;

  // Make RPC call to get decimals from contract
  const response = await axios.post(rpcUrl, {
    id: 1,
    jsonrpc: "2.0",
    method: "eth_call",
    params: [
      {
        data: "0x313ce567", // decimals() function selector
        to: address,
      },
      "latest",
    ],
  });

  // Check if response has result
  if (!response.data.result) {
    throw new Error(`No result from RPC for ${address}: ${JSON.stringify(response.data)}`);
  }

  // Convert hex result to decimal
  const actualDecimals = parseInt(response.data.result, 16);

  // Check for valid conversion
  if (Number.isNaN(actualDecimals)) {
    throw new Error(`Invalid decimals conversion for ${address}, could be an RPC issue`);
  }

  // Compare decimals
  expect(tokenDecimal).toBe(actualDecimals);
}

async function getTokenFiles(): Promise<string[]> {
  const files = await readdir(TOKENS_DIR);
  return files.filter((file) => file.endsWith(".json"));
}

describe("Token decimals validation", () => {
  it("should validate all token decimals against on-chain data", async () => {
    // Check if ROUTEMESH_API_KEY is set
    if (!process.env.ROUTEMESH_API_KEY) {
      console.warn("⚠️  ROUTEMESH_API_KEY not set, skipping decimals validation");
      return;
    }

    const jsonFiles = await getTokenFiles();

    for (const file of jsonFiles) {
      const filePath = join(TOKENS_DIR, file);
      const content = await readFile(filePath, "utf-8");
      const tokens: TokenInfo[] = JSON.parse(content);

      // Extract network name for display
      const fileName = basename(filePath, ".json");
      const network = fileName.replace(/-/g, "_").toUpperCase();

      // Extract chainId from first token
      const chainId = tokens[0]?.chainId;

      if (!chainId) {
        throw new Error(`Missing chainId in ${fileName}`);
      }

      // Generate RPC URL using RouteMesh
      const rpcUrl = `https://lb.routeme.sh/rpc/${chainId}/${process.env.ROUTEMESH_API_KEY}`;

      console.log(`Validating ${network} tokens (${tokens.length} tokens)...`);

      // Check decimals for each token
      for (const token of tokens) {
        await checkTokenDecimals(token, rpcUrl);
      }

      console.log(`✓ ${network} validation complete`);
    }
  });
});
