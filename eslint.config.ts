import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      'dist/',
      'coverage/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'docs/',
      'content/',
      'public/',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-console': 'error',
    },
  },
  {
    // The SSG plugin and the e2e suite run under Node where console output is intentional.
    files: ['src/ssg/**/*.ts', 'tests/**/*.ts', '*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
);
