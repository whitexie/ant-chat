import antfu from '@antfu/eslint-config'

export default antfu(
  {
    react: true,
    typescript: true,
    formatters: {
      css: true,
      html: true,
      markdown: 'prettier',
    },
    rules: {
      'no-console': ['off'],
      'ts/no-redeclare': ['off'],
    },
  },
  {
    files: ['packages/**/*.{ts,tsx}'],
  },
  {
    files: ['packages/electron/**/*.{ts,tsx}'],
    rules: {
      'ts/no-require-imports': ['off'],
      'node/prefer-global/process': ['off'],
    },
  },
  {
    files: ['packages/**/*.{spec,test}.{ts,tsx}'],
    rules: {
      'import/order': ['off'],
      'perfectionist/sort-imports': ['off'],
    },
  },
)
