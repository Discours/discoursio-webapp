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
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^log$'
          }
        ],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'warn',

        // solid-js fix
        'import/no-unresolved': [2, { ignore: ['solid-js/'] }]
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
    // FIXME
    'unicorn/prefer-dom-node-append': 'off',

    // TEMP
    // FIXME
    'solid/reactivity': 'off',

    // Should be enabled
    // 'promise/catch-or-return': 'off',

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
