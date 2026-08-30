import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const destination = resolve(root, "dist", "legal");
const files = ["LICENSE", "NOTICE", "THIRD_PARTY_NOTICES.md"];

await mkdir(destination, { recursive: true });
await Promise.all(files.map((file) =>
  copyFile(resolve(root, file), resolve(destination, file))
));

console.log(`Copied ${files.length} legal notice files to dist/legal.`);
