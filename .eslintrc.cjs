module.exports = {
  plugins: ['@typescript-eslint', 'import', 'sonarjs', 'unicorn', 'promise', 'solid', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
    'plugin:sonarjs/recommended',
    'plugin:unicorn/recommended',
    'plugin:promise/recommended',
    'plugin:solid/recommended',
    'plugin:jest/recommended',
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2021,
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        project: './tsconfig.json',
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking', // 23-01-2024 896 problems
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
  env: {
    browser: true,
    node: true,
    mocha: true,
  },
  globals: {},
  rules: {
    // Solid
    'solid/reactivity': 'off', // too many 'should be used within JSX'
    'solid/no-innerhtml': 'off',

    /** Unicorn **/
    'unicorn/no-null': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/prefer-string-replace-all': 'warn',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/import-style': 'off',
    'unicorn/numeric-separators-style': 'off',
    'unicorn/prefer-node-protocol': 'off',
    'unicorn/prefer-dom-node-append': 'off', // FIXME
    'unicorn/prefer-top-level-await': 'warn',
    'unicorn/consistent-function-scoping': 'warn',
    'unicorn/no-array-callback-reference': 'warn',
    'unicorn/no-array-method-this-argument': 'warn',
    'unicorn/no-for-loop': 'off',

    'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
    'sonarjs/prefer-immediate-return': 'warn',

    // Promise
    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',

    eqeqeq: 'error',
    'no-param-reassign': 'error',
    'no-nested-ternary': 'error',
    'no-shadow': 'error',

    'import/order': [
      'warn',
      {
        groups: ['type', 'builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        distinctGroup: false,
        pathGroups: [
          {
            pattern: '*.scss',
            patternOptions: { matchBase: true },
            group: 'index',
            position: 'after',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
}
