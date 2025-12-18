import { Config, Effect, Option } from "effect";

export class AppConfig extends Effect.Service<AppConfig>()("AppConfig", {
  effect: Effect.gen(function* () {
    const routemeshApiKey = yield* Config.string("VITE_ROUTEMESH_API_KEY").pipe(
      Config.option,
      Effect.map(Option.getOrUndefined),
    );

    const isCI = yield* Config.string("CI").pipe(
      Config.withDefault("false"),
      Effect.map((v) => v === "true"),
    );

    return { isCI, routemeshApiKey } as const;
  }),
}) {}
