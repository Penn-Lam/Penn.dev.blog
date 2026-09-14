import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

const config = defineConfig([
  ...nextVitals,
  prettierRecommended,
  {
    files: ['**/*.js?(x)'],
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          paths: ['src']
        },
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },
    rules: {
      'no-console': ['error', { allow: ['error', 'info'] }],
      'react/no-unescaped-entities': 0,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 0,
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      '@next/next/no-img-element': 0,
      'import/no-named-as-default': 0,
      // Preserve existing runtime behavior while adopting Next.js 16's expanded React Hooks rules.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off'
    }
  },
  {
    files: ['*.mjs'],
    rules: {
      'import/no-anonymous-default-export': 'off'
    }
  },
  {
    files: ['src/app/layout.js'],
    rules: {
      // Geist declares this subpath through an ambient module that eslint-plugin-import cannot resolve.
      'import/named': 'off'
    }
  },
  globalIgnores([
    '.next/**',
    '.agents/**',
    'src/components/base/**',
    'src/components/application/**',
    'src/components/foundations/**',
    'tools/oxlint/anti-slop/**'
  ])
])

export default config
