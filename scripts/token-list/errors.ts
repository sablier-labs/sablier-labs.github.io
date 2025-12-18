import { Data } from "effect";

// File System Errors
export class FileReadError extends Data.TaggedError("FileReadError")<{
  readonly path: string;
  readonly cause: unknown;
}> {}

export class FileWriteError extends Data.TaggedError("FileWriteError")<{
  readonly path: string;
  readonly cause: unknown;
}> {}

export class DirectoryReadError extends Data.TaggedError("DirectoryReadError")<{
  readonly path: string;
  readonly cause: unknown;
}> {}

// JSON Errors
export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  readonly input: string;
  readonly cause: unknown;
}> {}

// HTTP/RPC Errors
export class RpcError extends Data.TaggedError("RpcError")<{
  readonly address: string;
  readonly method: string;
  readonly cause: unknown;
}> {}

// Domain Errors
export class ChainNotSupportedError extends Data.TaggedError("ChainNotSupportedError")<{
  readonly chainId: number;
}> {}

export class InvalidDecimalsError extends Data.TaggedError("InvalidDecimalsError")<{
  readonly address: string;
  readonly expected: number;
  readonly actual: number;
}> {}
