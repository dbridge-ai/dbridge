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
      globals: globals.browser,
    },
  },
  {
    // 防回归（ui-unification-design.md 第 6 章）：业务代码禁止硬编码颜色
    // theme/ 目录为令牌唯一来源（白名单）。存量违规以 warn 起步，清理完成后升级 error。
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/theme/**'],
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}\\b/]",
          message:
            '硬编码颜色：请改用 theme/ 令牌（import from "../theme"）或 --db-* CSS 变量（见 ui-unification-design.md）',
        },
      ],
    },
  },
])
