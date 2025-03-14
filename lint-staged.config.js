/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  'packages/web/**/*.ts?(x)': () => 'tsc -p packages/web/tsconfig.json --noEmit',
  'src/**/*.{ts,js,jsx,tsx,vue}': 'eslint --fix',
}
