module.exports = {
  root: true,
  ignorePatterns: ['node_modules/'],
  extends: ['@react-native'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
  ],
  rules: {
    'react-native/no-inline-styles': 'off',
    'react/react-in-jsx-scope': 'off',
    semi: 'off',
    '@typescript-eslint/semi': 'off',
  },
}
