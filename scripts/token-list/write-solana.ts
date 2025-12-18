import { NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import { buildList } from "./build-solana.js";
import { TokenFileSystem } from "./services/TokenFileSystem.js";

const program = Effect.gen(function* () {
  const list = yield* buildList;
  const json = JSON.stringify(list, null, 2);
  yield* Console.log(json);
}).pipe(
  Effect.provide(TokenFileSystem.Default),
  Effect.tapError((error) => Console.error("Failed to build list:", error)),
);

NodeRuntime.runMain(program);
