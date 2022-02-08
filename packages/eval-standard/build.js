const process = require('process')
const esbuild = require('esbuild')
const { dependencies } = require('./package.json')
const external = dependencies ? Object.keys(dependencies) : []

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
  outdir: 'lib/',
  target: 'es6',
  sourcemap: true,
  bundle: true,
  minify: true,
  tsconfig: 'tsconfig.build.json',
  external,
  watch
}

esbuild
  .build({
    ...shared,
    format: 'esm',
    splitting: true
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    ...shared,
    format: 'cjs',
    outExtension: { '.js': '.cjs' }
  })
  .catch(() => process.exit(1))
