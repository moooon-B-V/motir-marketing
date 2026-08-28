import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// The same two shared configs motir-core extends, in the same order — and, like
// that repo, consumed as FLAT configs rather than through `FlatCompat`, which
// eslint-config-next 16 no longer supports.
export default defineConfig([
  globalIgnores(['.next/**', 'node_modules/**', 'next-env.d.ts']),
  nextVitals,
  nextTs,
])
