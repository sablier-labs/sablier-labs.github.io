import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import type { TokenInfo } from "@uniswap/token-lists";
import { Effect } from "effect";
import { DirectoryReadError, FileReadError, FileWriteError, JsonParseError } from "../errors.js";

export class TokenFileSystem extends Effect.Service<TokenFileSystem>()("TokenFileSystem", {
  dependencies: [NodeFileSystem.layer],
  effect: Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const readTokenFile = (path: string) =>
      Effect.gen(function* () {
        const content = yield* fs
          .readFileString(path)
          .pipe(Effect.mapError((cause) => new FileReadError({ cause, path })));
        return yield* Effect.try({
          catch: (cause) => new JsonParseError({ cause, input: path }),
          try: () => JSON.parse(content) as TokenInfo[],
        });
      });

    const readJsonFile = <T>(path: string) =>
      Effect.gen(function* () {
        const content = yield* fs
          .readFileString(path)
          .pipe(Effect.mapError((cause) => new FileReadError({ cause, path })));
        return yield* Effect.try({
          catch: (cause) => new JsonParseError({ cause, input: path }),
          try: () => JSON.parse(content) as T,
        });
      });

    const readDirectory = (path: string) =>
      fs
        .readDirectory(path)
        .pipe(Effect.mapError((cause) => new DirectoryReadError({ cause, path })));

    const writeFile = (path: string, content: string) =>
      fs
        .writeFileString(path, content)
        .pipe(Effect.mapError((cause) => new FileWriteError({ cause, path })));

    const exists = (path: string) => fs.exists(path);

    return { exists, readDirectory, readJsonFile, readTokenFile, writeFile } as const;
  }),
}) {}
