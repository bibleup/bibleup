// @ts-check
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default defineConfig({
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
  extends: [
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    eslintConfigPrettier,
  ],
  languageOptions: {
    parser: tseslint.parser,
    globals: globals.browser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      projectService: true,
      tsconfigRootDir: import.meta.dirname
    }
  },
  rules: {
    '@typescript-eslint/no-misused-promises': [
      'error',
      { 
        checksVoidReturn: {
          arguments: false
        }
      }
    ],
    "@typescript-eslint/ban-ts-comment": "error",
    "@typescript-eslint/consistent-type-imports": "error"
  },
  files: ['**/*.js', '**/*.ts'],
  ignores: ['/dist/**/*', '/demo/**/*', '.eslintrc.cjs']
})
