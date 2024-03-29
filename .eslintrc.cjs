module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          arguments: false
        }
      }
    ]
    //'semi-spacing': ['error', {'before': false, 'after': true}]
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  ignorePatterns: ['rollup.config.js', '/dist/**/*', '/demo/**/*', '.eslintrc.cjs'],
  plugins: [
    '@typescript-eslint'
  ]
}