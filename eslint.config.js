import antfu from '@antfu/eslint-config'
import lit from 'eslint-plugin-lit'
import wc from 'eslint-plugin-wc'

export default antfu(
  {
    typescript: true,
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },
    ignores: [
      'dist/**',
      'node_modules/**',
    ],
  },
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      lit,
      wc,
    },
    rules: {
      ...wc.configs['flat/recommended'].rules,
      ...lit.configs['flat/recommended'].rules,
    },
  },
)
