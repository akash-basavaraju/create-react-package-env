import resolve from "@rollup/plugin-node-resolve";
import commonToES6 from "@rollup/plugin-commonjs";
import del from "rollup-plugin-delete";
import { terser } from "rollup-plugin-terser";
import shebang from "rollup-plugin-add-shebang";

export default {
  input: "./src/index.js",
  output: { file: "bin/index.js", format: "cjs" },
  plugins: [
    del({ targets: "bin/*" }),
    resolve(),
    commonToES6({ include: "node_modules/**" }),
    terser(),
    shebang({
      include: "bin/index.js",
    }),
  ],
};
