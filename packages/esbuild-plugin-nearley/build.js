const process = require('process')
const esbuild = require('esbuild')
const { dependencies } = require('./package.json')
const external = Object.keys(dependencies)

let watch = process.argv.some((arg) => arg == '--watch')

if (watch) {
  watch = {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error)
      else console.log('watch build succeeded:', result)
    }
  }
}

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    platform: 'node',
    format: 'cjs',
    sourcemap: true,
    bundle: true,
    external,
    watch
  })
  .catch(() => process.exit(1))
