import { terser } from "rollup-plugin-terser";
import less from "rollup-plugin-less";

export default [
  {
    input: "./bibleup/js/main.js",
    output: [
      {
        file: "./dist/esm/bibleup.esm.min.js",
        format: "es",
        name: "BibleUp",
      },
      {
        file: "./dist/umd/bibleup.min.js",
        format: "umd",
        name: "BibleUp", //name of the global object
        sourcemap: true,
      },
    ],
    plugins: [
      less({
        insert: true,
        output: false,
      }),
      terser(),
    ],
  },

  // BibleUp CORE
  {
    input: "./bibleup/js/main.js",
    output: [
      {
        file: "./dist/esm/bibleup-core.esm.min.js",
        format: "es",
        name: "BibleUp",
      },
      {
        file: "./dist/umd/bibleup-core.min.js",
        format: "umd",
        name: "BibleUp", //name of the global object
        sourcemap: true,
      },
    ],
    plugins: [
        less({
          insert: false,
          output: "./dist/css/bibleup.css",
        }),
        terser(),
      ],
  },
];
