import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import less from 'rollup-plugin-less';

export default [
    {
        input: './bibleup/js/main.js',
        output: {
            file: './dist/bibleup.es.min.js',
            format: 'es',
            name: 'BibleUp'
        },
        plugins: [
            less({
                insert: 'true',
                output: 'dist/css/bibleup.build.css'
            }),
            terser()
        ]
    },
    {
        // UMD
        input: './bibleup/js/main.js',
        output: {
          file: './dist/umd/bibleup.min.js',
          format: "umd",
          name: "BibleUp", //name of the global object
          sourcemap: true,
        },
        plugins: [
            less({
                insert: 'true',
                output: 'dist/css/bibleup.build.css'
            }),
            /* babel({
                exclude: 'node_modules/**',
                babelHelpers: "bundled"
            }), */
            terser()
          ]
    }
]