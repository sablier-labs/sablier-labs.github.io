import { readFile } from "node:fs/promises";
import type { TokenInfo, TokenList } from "@uniswap/token-lists";
import axios from "axios";
import { config } from "dotenv";
import { sablier } from "sablier";
import { describe, expect, it } from "vitest";

// Load environment variables from .env file
config();

const TOKEN_LIST_PATH = "token-list/evm.json";

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
  it("should validate all token decimals against on-chain data", async () => {
    // Check if ROUTEMESH_API_KEY is set
    if (!process.env.ROUTEMESH_API_KEY) {
      console.warn("⚠️  ROUTEMESH_API_KEY not set, skipping decimals validation");
      return;
    }

    // Read the consolidated token list
    const content = await readFile(TOKEN_LIST_PATH, "utf-8");
    const tokenList: TokenList = JSON.parse(content);

    // Group tokens by chainId
    const tokensByChain = new Map<number, TokenInfo[]>();
    for (const token of tokenList.tokens) {
      const chainTokens = tokensByChain.get(token.chainId) ?? [];
      chainTokens.push(token);
      tokensByChain.set(token.chainId, chainTokens);
    }

    // Validate tokens for each chain
    for (const [chainId, tokens] of tokensByChain) {
      const chain = sablier.chains.get(chainId);

      if (!chain || !chain.rpc.routemesh) {
        throw new Error(`Chain ${chainId} not supported by sablier package`);
      }

      // Generate RPC URL using RouteMesh
      const rpcUrl = chain.rpc.routemesh(process.env.ROUTEMESH_API_KEY);

      console.log(`Validating ${chain.name} tokens (${tokens.length} tokens)...`);

      // Check decimals for each token
      for (const token of tokens) {
        await checkTokenDecimals(token, rpcUrl);
      }

      console.log(`✓ ${chain.name} validation complete`);
    }
  });
});
