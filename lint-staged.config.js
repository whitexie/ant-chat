/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  '**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',
  'src/**/*.{ts,js,jsx,tsx,vue}': 'eslint --fix',
}
