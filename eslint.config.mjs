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
    },
  },
  {
    files: ['packages/**/*.{ts,tsx}'],
  },

  {
    files: ['packages/electron/**/*.{ts,tsx}'],
    rules: {
      'ts/no-require-imports': ['off'],
    },
  },
)
