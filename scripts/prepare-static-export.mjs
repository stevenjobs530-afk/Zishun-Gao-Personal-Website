import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const outputDirectory = resolve("dist/client");
const publicDirectory = resolve("public");
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath = rawBasePath === "/" ? "" : rawBasePath.replace(/\/$/, "");
const textExtensions = new Set([".css", ".html", ".js", ".json", ".rsc"]);

if (basePath && (!basePath.startsWith("/") || basePath.includes("://"))) {
  throw new Error(`NEXT_PUBLIC_BASE_PATH must be an origin-relative path: ${basePath}`);
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else files.push(path);
  }

  return files;
}

const publicEntries = await readdir(publicDirectory, { withFileTypes: true });
const pathRoots = [
  "assets",
  ...publicEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name),
];
const rootFiles = publicEntries.filter((entry) => entry.isFile()).map((entry) => entry.name);

function protectedReplace(contents, rootPath, prefixedPath, token) {
  return contents
    .replaceAll(prefixedPath, token)
    .replaceAll(rootPath, prefixedPath)
    .replaceAll(token, prefixedPath);
}

function rootsForExtension(extension) {
  // Component-authored URLs in JS/RSC already use NEXT_PUBLIC_BASE_PATH at
  // runtime. Rewriting those source literals as well would apply the prefix
  // twice. HTML and CSS contain final URLs and still need full rewriting.
  return extension === ".html" || extension === ".css" ? pathRoots : ["assets"];
}

function prefixRootPaths(contents, extension) {
  if (!basePath) return contents;

  let updated = contents;

  for (const root of rootsForExtension(extension)) {
    updated = protectedReplace(
      updated,
      `/${root}/`,
      `${basePath}/${root}/`,
      `__STATIC_ROOT_${root.toUpperCase().replaceAll("-", "_")}__`,
    );
  }

  for (const file of extension === ".html" || extension === ".css" ? rootFiles : []) {
    updated = protectedReplace(
      updated,
      `/${file}`,
      `${basePath}/${file}`,
      `__STATIC_FILE_${file.toUpperCase().replaceAll(/[^A-Z0-9]/g, "_")}__`,
    );
  }

  // Vite's preload helper can construct lazy chunk paths from an origin root.
  updated = updated.replaceAll("return`/`+e", `return\`${basePath}/\`+e`);

  return updated;
}

let files = await collectFiles(outputDirectory);

for (const file of files) {
  const extension = extname(file);
  if (!textExtensions.has(extension)) continue;
  const contents = await readFile(file, "utf8");
  const updated = prefixRootPaths(contents, extension);
  if (updated !== contents) await writeFile(file, updated);
}

await writeFile(join(outputDirectory, ".nojekyll"), "");
await writeFile(
  join(outputDirectory, "404.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Zishun Gao</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1110;color:#f4f0e8;font:16px/1.6 system-ui,sans-serif}main{max-width:34rem;padding:2rem}a{color:#d6b982}</style></head><body><main><p>404</p><h1>Page not found</h1><p>The requested portfolio page is unavailable.</p><a href="${basePath}/?lang=en">Return to the portfolio</a></main></body></html>`,
);

const requiredPages = [
  "index.html",
  "case-studies/ai-assisted-job-workflow/index.html",
  "case-studies/apple-app-store/index.html",
  "case-studies/early-career-wellbeing/index.html",
  "case-studies/uk-retail/index.html",
  "personal-projects/personal-training/index.html",
  "404.html",
];

for (const page of requiredPages) {
  await readFile(join(outputDirectory, page));
}

files = await collectFiles(outputDirectory);
const unresolved = [];

for (const file of files) {
  const extension = extname(file);
  if (!textExtensions.has(extension)) continue;
  const contents = await readFile(file, "utf8");

  if (basePath && contents.includes(`${basePath}${basePath}`)) {
    unresolved.push(`${file}: duplicated base path`);
  }

  if (extension === ".js" && basePath) {
    for (const root of pathRoots.filter((entry) => entry !== "assets")) {
      if (contents.includes(`${basePath}/${root}/`)) {
        unresolved.push(`${file}: runtime public path was prefixed before hydration (${root})`);
      }
    }
  }

  for (const root of rootsForExtension(extension)) {
    const rootPath = `/${root}/`;
    const withoutPrefixedPaths = basePath
      ? contents.replaceAll(`${basePath}${rootPath}`, "")
      : contents;
    if (basePath && withoutPrefixedPaths.includes(rootPath)) {
      unresolved.push(`${file}: unresolved ${rootPath}`);
    }
  }

  if ([".html", ".rsc"].includes(extname(file)) && contents.includes("/_vinext/image")) {
    unresolved.push(`${file}: unresolved /_vinext/image`);
  }
}

if (unresolved.length) {
  throw new Error(`Static export contains unresolved paths:\n${unresolved.join("\n")}`);
}

console.log(`Prepared static export for ${basePath || "/"}`);
