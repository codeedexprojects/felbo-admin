import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  // 1. Next.js Core Web Vitals
  ...nextVitals,

  // 2. Next.js TypeScript
  ...nextTs,

  // 3. Prettier Recommended (must be last to override)
  prettierRecommended,

  // 4. Global Ignores
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**'],
  },
]);
