module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['airbnb-typescript', 'prettier'],
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    project: ['./tsconfig.json'], //required for "type-aware linting"
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  globals: {
    window: true,
  },
  rules: {
    '@typescript-eslint/no-shadow': 'off',
    'import/no-extraneous-dependencies': ['error', { peerDependencies: true }],
    'no-label-var': 'error',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'prefer-spread': 'off',
    'func-names': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'no-bitwise': 'off',
    'no-continue': 'off',
    'no-multi-assign': 'off',
    'no-prototype-builtins': 'off',
    'prefer-destructuring': 'off',
    semi: 'error',
  },
};
