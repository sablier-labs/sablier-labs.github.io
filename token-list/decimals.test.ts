import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { TokenInfo } from "@uniswap/token-lists";
import axios from "axios";
import { config } from "dotenv";
import { sablier } from "sablier";
import { describe, expect, it } from "vitest";

// Load environment variables from .env file
config({ quiet: true });

const CHAIN_DIR = "token-list/evm";

// Load chain files at module level for it.each()
const chainFiles = readdirSync(CHAIN_DIR).filter((file) => file.endsWith(".json"));

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

describe("Token decimals validation", () => {
  it.each(chainFiles)("should validate %s tokens against on-chain data", async (file) => {
    // Check if ROUTEMESH_API_KEY is set
    if (!process.env.ROUTEMESH_API_KEY) {
      console.warn("⚠️  ROUTEMESH_API_KEY not set, skipping decimals validation");
      return;
    }

    const chainId = Number.parseInt(file.replace(".json", ""), 10);
    const filePath = join(CHAIN_DIR, file);

    // Read tokens for this chain
    const content = await readFile(filePath, "utf-8");
    const tokens: TokenInfo[] = JSON.parse(content);

    const chain = sablier.chains.get(chainId);

    if (!chain) {
      throw new Error(`Chain ${chainId} not supported by sablier package`);
    }

    // Generate RPC URL using RouteMesh
    const rpcUrl = chain.rpc.routemesh(process.env.ROUTEMESH_API_KEY);

    console.log(`Validating ${chain.name} tokens (${tokens.length} tokens)...`);

    // Parallel token validation using Promise.all
    await Promise.all(tokens.map((token) => checkTokenDecimals(token, rpcUrl)));

    console.log(`✓ ${chain.name} validation complete`);
  });
});
