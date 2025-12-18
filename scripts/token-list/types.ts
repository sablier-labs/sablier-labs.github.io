import type { TokenInfo } from "@uniswap/token-lists";

export interface SolanaToken extends TokenInfo {
  cluster: string;
  program?: string;
}
