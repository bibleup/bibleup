import { terser } from 'rollup-plugin-terser'
import less from 'rollup-plugin-less'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import license from 'rollup-plugin-license'

const babelConfig = babel({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '>= 0.5%, not dead',
        useBuiltIns: 'usage',
        corejs: '3.23.4'
      }
    ]
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  exclude: '/node_modules/**',
  babelHelpers: 'runtime'
})

const addLicense = license({
  banner: `
  BibleUp
  Copyright 2023 BibleUp and contributors
  Repository URL: https://github.com/Bibleup/bibleup.js.git
  Date: <%= moment().format('DD-MM-YYYY') %>
  `
})

export default [
  {
    input: './bibleup/js/bibleup.js',
    output: [
      {
        file: './dist/esm/bibleup.esm.js',
        format: 'es',
        name: 'BibleUp'
      }
    ]
  },

  {
    input: './bibleup/js/bibleup.js',
    output: [
      {
        file: './dist/umd/bibleup-core.min.js',
        format: 'umd',
        name: 'BibleUp', // name of the global object
        sourcemap: true
      }
    ],
    plugins: [
      // minified but no css
      nodeResolve(),
      commonjs({
        include: 'node_modules/**'
      }),
      babelConfig,
      terser(),
      addLicense
    ]
  },

  {
    input: './bibleup/js/main.js',
    output: [
      {
        file: './dist/umd/bibleup.min.js',
        format: 'umd',
        name: 'BibleUp', // name of the global object
        sourcemap: true
      }
    ],
    plugins: [
      // minified and css
      less({
        insert: true,
        output: './dist/css/bibleup.css'
      }),
      nodeResolve(),
      commonjs({
        include: 'node_modules/**'
      }),
      babelConfig,
      terser(),
      addLicense
    ]
  }
]
