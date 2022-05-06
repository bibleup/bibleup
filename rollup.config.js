import { terser } from "rollup-plugin-terser";
import less from "rollup-plugin-less";

export default [
  {
    input: "./bibleup/js/bibleup.js",
    output: [
      {
        file: "./dist/esm/bibleup.esm.js",
        format: "es",
        name: "BibleUp",
      },
      {
        file: "./dist/umd/bibleup-core.js",
        format: "umd",
        name: "BibleUp", //name of the global object
        sourcemap: true,
      },
    ]
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
      less({
        insert: true,
        output: './dist/css/bibleup.css',
      }),
      terser(),
    ],
  }
];
