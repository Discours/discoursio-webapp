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
    'plugin:jest/recommended'
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2021,
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        project: './tsconfig.json'
      },
      extends: [
        'plugin:@typescript-eslint/recommended'
        // Maybe one day...
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_'
          }
        ],
        '@typescript-eslint/no-non-null-assertion': 'error',
        // TODO: Remove any usage and enable
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  env: {
    browser: true,
    node: true,
    mocha: true
  },
  globals: {},
  rules: {
    // Solid
    'solid/reactivity': 'off', // FIXME
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

    'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],

    // Promise
    // 'promise/catch-or-return': 'off',  // Should be enabled
    'promise/always-return': 'off',

    eqeqeq: 'error',
    'no-param-reassign': 'error',
    'no-nested-ternary': 'error',
    'no-shadow': 'error'
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true
    }
  }
}
