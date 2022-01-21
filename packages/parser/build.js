const process = require('process')
const esbuild = require('esbuild')
const NearleyPlugin = require('esbuild-plugin-nearley')
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

const shared = {
  target: 'es6',
  entryPoints: ['src/index.ts'],
  sourcemap: true,
  bundle: true,
  external,
  plugins: [NearleyPlugin.default],
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
    platform: 'browser',
    format: 'cjs'
  })
  .catch(() => process.exit(1))
