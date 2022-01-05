const process = require('process')
const esbuild = require('esbuild')

let watch = process.argv.some((arg) => arg == '--watch')
if (watch) {
  watch = {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error)
      else console.log('watch build succeeded:', result)
    }
  }
}

const shared = {
  entryPoints: ['src/index.ts'],
  sourcemap: true,
  bundle: true,
  watch
}

esbuild
  .build({
    ...shared,
    outfile: 'lib/index.js',
    platform: 'browser',
    format: 'iife'
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    ...shared,
    outfile: 'lib/index.cjs',
    platform: 'node',
    format: 'cjs'
  })
  .catch(() => process.exit(1))
