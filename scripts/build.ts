export {};

// Bundle the frontend TypeScript into a single JS file.
// jspdf and jspdf-autotable are loaded as UMD globals via <script> tags,
// so they must be excluded from the bundle.
// lz-string is bundled from node_modules (used by url-sharing.ts).
const result = await Bun.build({
  entrypoints: ["./public/js/app.ts"],
  outdir: "./public/js",
  naming: "[name].js",
  target: "browser",
  format: "esm",
  minify: true,
  sourcemap: "external",
  external: ["jspdf", "jspdf-autotable"],
});

if (!result.success) {
  console.error("Build failed:");
  for (const msg of result.logs) {
    console.error(msg);
  }
  process.exit(1);
}

console.log("Build complete.");
