import { terser } from "rollup-plugin-terser";
import less from "rollup-plugin-less";

export default [
  {
    input: "./bibleup/js/main.js",
    output: [
      {
        file: "./dist/bibleup.esm.min.js",
        format: "es",
        name: "BibleUp",
      },
      {
        file: "./dist/bibleup.min.js",
        format: "umd",
        name: "BibleUp", //name of the global object
        sourcemap: true,
      },
    ],
    plugins: [
      less({
        insert: "true",
        output: "dist/bibleup.css",
      }),
      terser(),
    ],
  },

  // BibleUp CORE
  {
    input: "./bibleup/js/main.js",
    output: [
      {
        file: "./dist/bibleup-core.esm.min.js",
        format: "es",
        name: "BibleUp",
      },
      {
        file: "./dist/bibleup-core.min.js",
        format: "umd",
        name: "BibleUp", //name of the global object
        sourcemap: true,
      },
    ],
    plugins: [
        less({
          insert: "false",
          output: "dist/bibleup.css",
        }),
        terser(),
      ],
  },
];
