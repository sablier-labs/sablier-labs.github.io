import { HttpClient, HttpClientRequest } from "@effect/platform";
import { NodeHttpClient } from "@effect/platform-node";
import { Effect, Schedule } from "effect";
import { RpcError } from "../errors.js";

interface RpcRequest {
  readonly id: number;
  readonly jsonrpc: "2.0";
  readonly method: string;
  readonly params: unknown[];
}

interface RpcResponse {
  readonly result?: string;
  readonly error?: { message: string };
}

export class RpcClient extends Effect.Service<RpcClient>()("RpcClient", {
  dependencies: [NodeHttpClient.layerUndici],
  effect: Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;

    const call = (rpcUrl: string, request: RpcRequest) =>
      Effect.gen(function* () {
        const req = HttpClientRequest.post(rpcUrl);
        const reqWithBody = yield* HttpClientRequest.bodyJson(req, request);
        const response = yield* httpClient.execute(reqWithBody);
        const json = yield* response.json;
        return json as RpcResponse;
      }).pipe(
        Effect.scoped,
        Effect.mapError((cause) => new RpcError({ address: "", cause, method: request.method })),
      );

    const getDecimals = (rpcUrl: string, address: string) =>
      Effect.gen(function* () {
        const response = yield* call(rpcUrl, {
          id: 1,
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ data: "0x313ce567", to: address }, "latest"],
        });

        // Check for RPC error first
        if (response.error) {
          return yield* Effect.fail(
            new RpcError({ address, cause: response.error.message, method: "decimals" }),
          );
        }

        if (!response.result || response.result === "0x") {
          return yield* Effect.fail(
            new RpcError({
              address,
              cause: "Empty RPC response (rate limit or invalid contract)",
              method: "decimals",
            }),
          );
        }

        const decimals = Number.parseInt(response.result, 16);
        if (Number.isNaN(decimals)) {
          return yield* Effect.fail(
            new RpcError({ address, cause: "Invalid decimals conversion", method: "decimals" }),
          );
        }

        return decimals;
      }).pipe(
        Effect.retry(Schedule.exponential("1 second").pipe(Schedule.intersect(Schedule.recurs(2)))),
      );

    return { call, getDecimals } as const;
  }),
}) {}
