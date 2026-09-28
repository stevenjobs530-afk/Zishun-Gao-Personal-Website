// Regenerates the carousel-sized WebP derivatives of the honours certificates.
// The original PNGs stay untouched and are still used in the enlarged dialog.
// Run manually after adding or replacing a certificate:
//   node scripts/generate-certificate-thumbnails.mjs
// Uses the `sharp` build that the Next.js toolchain already installs.
import { mkdir, readdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const sourceDirectory = "public/achievements";
const outputDirectory = join(sourceDirectory, "thumbs");
// The carousel renders certificates at most ~570 CSS px wide; 1000 px covers 3x phone screens.
const maxWidth = 1000;

await mkdir(outputDirectory, { recursive: true });

for (const file of (await readdir(sourceDirectory)).filter((name) => name.endsWith(".png")).sort()) {
  const source = join(sourceDirectory, file);
  const output = join(outputDirectory, `${parse(file).name}.webp`);
  await sharp(source).resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
  const [before, after] = await Promise.all([stat(source), stat(output)]);
  console.log(`${output}: ${Math.round(before.size / 1024)} KB -> ${Math.round(after.size / 1024)} KB`);
}
