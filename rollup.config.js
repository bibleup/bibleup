import { defineConfig } from 'rollup';
import terser from '@rollup/plugin-terser'
import less from 'rollup-plugin-less'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import license from 'rollup-plugin-license'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import { deleteAsync } from 'del'
import pkg from './package.json' assert { type: "json" };

const babelConfig = babel({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '>= 0.5%, not dead',
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  exclude: '/node_modules/**',
  babelHelpers: 'runtime',
});

const addLicense = license({
  banner: `
  BibleUp v.<%= pkg.version %>
  Copyright 2023-present BibleUp and contributors
  Repository URL: https://github.com/Bibleup/bibleup.ts.git
  Date: <%= moment().format('DD-MM-YYYY') %>
  `,
});

/**
 * This deletes all '/type' sub-folder under each dist folder
 * The typescript() plugin causes this to happen after which the '/type' folder under '/esm' will be read
 * and bundled using the dts() plugin
 */
const myDel = () => {
  return {
    name: 'types-delete',
    buildEnd: async () => {
      const deletedFiles = await deleteAsync(['dist/*/types']);
      console.log(`Deleted ${deletedFiles.length} files - ${deletedFiles}`);
    }
  }
}

export default defineConfig([

  /* BibleUp UMD - Minified and CSS */
  {
    input: './bibleup/main.ts',
    output: [
      {
        file: pkg.browser,
        format: 'umd',
        name: 'BibleUp', // name of the global object
        sourcemap: true,
      },
    ],
    plugins: [
      typescript(),
      less({
        insert: true,
        output: pkg.exports['./css'],
      }),
      nodeResolve(),
      commonjs({
        include: 'node_modules/**',
      }),
      babelConfig,
      terser(),
      addLicense,
    ],
  },

  /* BibleUp ESM module - Without CSS */
  {
    input: './bibleup/bibleup.ts',
    output: [
      {
        file: pkg.module,
        format: 'es',
        name: 'BibleUp',
        sourcemap: true,
      }
    ],
    plugins: [typescript(), addLicense],
  },

  /* BibleUp Core - Without CSS */
  {
    input: './bibleup/bibleup.ts',
    output: [
      {
        file: './dist/umd/bibleup-core.min.js', // ./dist/umd/bibleup-core.min.js
        format: 'umd',
        name: 'BibleUp', // name of the global object
        sourcemap: true,
      },
    ],
    plugins: [
      // minified but no css
      typescript(),
      nodeResolve(),
      commonjs({
        include: 'node_modules/**',
      }),
      babelConfig,
      terser(),
      addLicense,
    ],
  },

  /**
   * This bundles the typescript declaration file
   * A single '.d.ts' declaration file will be exported and placed under dist root
   */
  {
    input: "./dist/esm/types/bibleup.d.ts",
    output: [{ file: pkg.types, format: "es" }],
    plugins: [dts(), myDel()]
  }
]);
