// Minimal ESLint flat config — keeps linting simple and avoids plugin import/runtime issues
import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['node_modules', 'dist'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      semi: 'off',
    },
  },
]
