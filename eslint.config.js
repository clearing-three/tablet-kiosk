import antfu from '@antfu/eslint-config'
import { configs as litConfigs } from 'eslint-plugin-lit'
import { configs as wcConfigs } from 'eslint-plugin-wc'

export default antfu(
  {
  },
  {
    ...litConfigs['flat/recommended'],
    ...wcConfigs['flat/best-practice'],
  },
)
