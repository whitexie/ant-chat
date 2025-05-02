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
    unocss: {
      attributify: true,
      strict: true,
    },
    rules: {
      'no-console': ['off'],
      'unocss/order': 'error',
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
