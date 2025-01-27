import { build } from "tsup";
import fse from "fs-extra/esm";

/**
 * The `tsup` configuration does not support file name customization, see:
 * https://github.com/egoist/tsup/issues/939
 *
 * So we manually rename the output files using fs-extra package.
 */

/**
 * @type {import('tsup').Options}
 */
const baseConfig = {
  entry: ["./src/index.ts"],
  outDir: "./dist/raw",
  format: ["cjs", "esm"],
  target: "es6",
  splitting: false,
  clean: true,
  dts: true,
};

/**
 * @type {import('tsup').Options}
 */
const minConfig = {
  ...baseConfig,
  outDir: "./dist/min",
  minify: true,
};

await fse.remove("./dist");
await build(baseConfig);
await build(minConfig);

await fse.move("./dist/raw/index.js", "./dist/index.js");
await fse.move("./dist/raw/index.mjs", "./dist/index.mjs");
await fse.move("./dist/raw/index.d.ts", "./dist/index.d.ts");
await fse.move("./dist/raw/index.d.mts", "./dist/index.d.mts");
await fse.remove("./dist/raw");

await fse.move("./dist/min/index.js", "./dist/index.min.js");
await fse.move("./dist/min/index.mjs", "./dist/index.min.mjs");
await fse.move("./dist/min/index.d.ts", "./dist/index.min.d.ts");
await fse.move("./dist/min/index.d.mts", "./dist/index.min.d.mts");
await fse.remove("./dist/min");
