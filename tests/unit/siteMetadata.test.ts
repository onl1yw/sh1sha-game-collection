import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../..", import.meta.url));
const html = readFileSync(join(root, "index.html"), "utf8");

describe("site metadata", () => {
  it("publishes the branded favicon and absolute social preview metadata", () => {
    expect(html).toContain('rel="icon" type="image/svg+xml" href="./favicon.svg"');
    expect(html).toContain(
      'property="og:image"\n      content="https://games.sh1sha.ru/social-preview.png"',
    );
    expect(html).toContain('name="twitter:card" content="summary_large_image"');

    const favicon = readFileSync(join(root, "public/favicon.svg"), "utf8");
    expect(favicon).toContain('stroke="#f2c94c"');
    expect(favicon).toContain("M17.32 5H6.68");
  });

  it("keeps the social preview at the documented GitHub aspect ratio", () => {
    const preview = readFileSync(join(root, "public/social-preview.png"));
    expect(preview.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(preview.readUInt32BE(16)).toBe(1280);
    expect(preview.readUInt32BE(20)).toBe(640);
  });
});
