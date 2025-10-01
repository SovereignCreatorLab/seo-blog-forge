import next from '@next/eslint-plugin-next';
export default [
  next.configs['core-web-vitals'],
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
