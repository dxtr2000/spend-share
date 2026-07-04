import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from '@vue/eslint-config-typescript'

export default [
  {
    ignores: [
      '.codex',
      '**/dist',
      '**/dev-dist',
      '**/node_modules',
      '**/coverage',
      'backend/data'
    ]
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  ...tseslint(),
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      'vue/attribute-hyphenation': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'error',
      'vue/singleline-html-element-content-newline': 'off'
    }
  },
  {
    files: ['backend/**/*.ts'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly'
      }
    }
  }
]