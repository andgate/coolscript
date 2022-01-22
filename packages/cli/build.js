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

const shared = {
  entryPoints: ['src/index.ts'],
  sourcemap: true,
  bundle: true,
  target: 'es6',
  external,
  watch
}

esbuild
  .build({
    ...shared,
    outdir: 'lib/',
    tsconfig: 'tsconfig.build.json',
    format: 'esm',
    splitting: true
  })
  .catch(() => process.exit(1))
