import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // react-hooks v7 で recommended 入りした比較的新しいルール。
      // 「effect 内でデータ取得 → setState」という本プロジェクトの標準ロードパターンが
      // 一律で該当する。是正はデータ取得層の設計変更を伴う（別 Issue で扱う）ため、
      // それまでは error ではなく warn に留めて CI を通す
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Context は「Provider（コンポーネント）＋ useXxx（フック）を1ファイルで提供する」
    // 一般的なパターンを採用している。このルールは開発時の Fast Refresh（HMR）の質の
    // 話で本番挙動には影響しないため、contexts 配下に限って無効化する
    files: ['src/contexts/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
