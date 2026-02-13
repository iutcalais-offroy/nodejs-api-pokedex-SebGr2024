import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  {
    ignores: [
      'src/generated',
      'dist',
      'build',
      'public',
      'prisma',
      'src/index.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettier,

  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'error',
      'no-console': 'warn',
    },
  },
)
