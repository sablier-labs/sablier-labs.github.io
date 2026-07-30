import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "@effect/vitest";
import type { TokenInfo } from "@uniswap/token-lists";

/**
 * This suite validates token-list references into `tokens/`. The reciprocal
 * `new-ui/core/isomorphic/tokens/images/cdn-assets.test.ts` suite validates URLs constructed by
 * application code against this repository.
 */
const FILES_TOKEN_LOGO_BASE_URL = "https://files.sablier.com/tokens/";
const TOKENS_DIR = path.join(__dirname, "../tokens");
const SOURCE_DIRS = [path.join(__dirname, "evm"), path.join(__dirname, "solana")];

/** PNG signature: the first eight bytes of every valid PNG file. */
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Logos are served to every client that loads the list, so a stray multi-megabyte image is a real
 * cost. The entries below predate this check; shrink them rather than extending the list.
 */
const MAX_LOGO_BYTES = 150 * 1024;
const approvedOversizedLogos = ["DPHN.png", "JD.png", "LLM.png", "MYU.png"];

type LogoReference = {
  filename: string;
  source: string;
  symbol: string;
};

/** Read the source chain/cluster files rather than the generated list, so no build is required. */
function readSourceTokens(): { source: string; tokens: TokenInfo[] }[] {
  const results: { source: string; tokens: TokenInfo[] }[] = [];
  for (const dir of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) {
      continue;
    }
    for (const entry of fs.readdirSync(dir).sort()) {
      if (!entry.endsWith(".json")) {
        continue;
      }
      const filePath = path.join(dir, entry);
      results.push({
        source: path.relative(path.join(__dirname, ".."), filePath),
        tokens: JSON.parse(fs.readFileSync(filePath, "utf8")),
      });
    }
  }
  return results;
}

/** Collect every logo reference that points at our own CDN. External URIs are out of scope. */
function collectLocalLogoReferences(): LogoReference[] {
  const references: LogoReference[] = [];
  for (const { source, tokens } of readSourceTokens()) {
    for (const token of tokens) {
      if (!token.logoURI?.startsWith(FILES_TOKEN_LOGO_BASE_URL)) {
        continue;
      }
      references.push({
        filename: token.logoURI.slice(FILES_TOKEN_LOGO_BASE_URL.length),
        source,
        symbol: token.symbol,
      });
    }
  }
  return references;
}

function listLogoFiles(): string[] {
  return fs
    .readdirSync(TOKENS_DIR)
    .filter((entry) => entry.endsWith(".png"))
    .sort();
}

describe("token logos", () => {
  it("every locally hosted logo reference resolves to a file", () => {
    const references = collectLocalLogoReferences();
    expect(references.length).toBeGreaterThan(0);

    const dangling = references
      .filter((reference) => !fs.existsSync(path.join(TOKENS_DIR, reference.filename)))
      .map(
        (reference) => `${reference.source}: ${reference.symbol} -> tokens/${reference.filename}`,
      );

    expect(
      dangling,
      `logoURI points at a file that does not exist, so it 404s on files.sablier.com:\n${dangling.join("\n")}`,
    ).toEqual([]);
  });

  it("every .png logo is actually a PNG", () => {
    const mislabeled: string[] = [];
    for (const filename of listLogoFiles()) {
      const header = Buffer.alloc(PNG_MAGIC.length);
      const handle = fs.openSync(path.join(TOKENS_DIR, filename), "r");
      try {
        fs.readSync(handle, header, 0, PNG_MAGIC.length, 0);
      } finally {
        fs.closeSync(handle);
      }
      if (!header.equals(PNG_MAGIC)) {
        mislabeled.push(filename);
      }
    }

    expect(
      mislabeled,
      `files named .png whose contents are not PNG (convert with \`sips -s format png\`):\n${mislabeled.join("\n")}`,
    ).toEqual([]);
  });

  it("no logo exceeds the size budget", () => {
    const oversized = listLogoFiles()
      .filter((filename) => !approvedOversizedLogos.includes(filename))
      .map((filename) => ({
        filename,
        kb: Math.round(fs.statSync(path.join(TOKENS_DIR, filename)).size / 1024),
      }))
      .filter((logo) => logo.kb * 1024 > MAX_LOGO_BYTES)
      .map((logo) => `${logo.filename} (${logo.kb} KB)`);

    expect(
      oversized,
      `logos exceed ${MAX_LOGO_BYTES / 1024} KB; downscale with \`sips -s format png -Z 256\`:\n${oversized.join("\n")}`,
    ).toEqual([]);
  });

  it("approved oversized logos still exist", () => {
    // Keeps the allowlist honest: a renamed or deleted entry should be pruned, not left dangling.
    for (const filename of approvedOversizedLogos) {
      expect(
        fs.existsSync(path.join(TOKENS_DIR, filename)),
        `stale allowlist entry: ${filename}`,
      ).toBe(true);
    }
  });
});
