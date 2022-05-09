import { terser } from "rollup-plugin-terser";
import less from "rollup-plugin-less";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

const babelConfig = babel({
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          ie: "11",
        },
      },
    ],
  ],
  babelHelpers: "bundled",
  exclude: "node_modules/**",
})


export default [
  {
    input: "./bibleup/js/bibleup.js",
    output: [
      {
        file: "./dist/esm/bibleup.esm.js",
        format: "es",
        name: "BibleUp",
      }
    ],
    plugins: [
      // no minified, no css
      resolve(),
      babelConfig
    ],
  },

  {
    input: "./bibleup/js/bibleup.js",
    output: [
      {
        file: "./dist/umd/bibleup-core.min.js",
        format: "umd",
        name: "BibleUp", //name of the global object
        sourcemap: true,
      },
    ],
    plugins: [
      // minified but no css
      resolve(),
      babelConfig,
      terser(),
    ],
  },

  {
    input: "./bibleup/js/main.js",
    output: [
      {
        file: "./dist/umd/bibleup.min.js",
        format: "umd",
        name: "BibleUp", //name of the global object
        sourcemap: true,
      },
    ],
    plugins: [
      // minified and css
      less({
        insert: true,
        output: "./dist/css/bibleup.css",
      }),
      babelConfig,
      terser(),
    ],
  },
];
