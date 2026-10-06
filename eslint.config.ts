import { defineConfig } from 'eslint/config';
import type { Rule } from 'eslint';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const noComments: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow comments of any kind (ADR 0033).' },
    messages: { comment: 'Comments are not allowed; say it in names, types, tests or docs/.' },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          context.report({ loc: comment.loc ?? context.sourceCode.ast.loc, messageId: 'comment' });
        }
      },
    };
  },
};

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
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      kphoto: { rules: { 'no-comments': noComments } },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-console': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'kphoto/no-comments': 'error',
    },
  },
  {
    files: ['src/ssg/**/*.ts', 'tests/**/*.ts', '*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
);
