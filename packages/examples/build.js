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
  outdir: 'lib/',
  target: 'es7',
  loader: { '.cs': 'text' },
  sourcemap: true,
  bundle: true,
  tsconfig: 'tsconfig.build.json',
  watch
}

esbuild
  .build({
    ...shared,
    format: 'esm'
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    ...shared,
    format: 'cjs',
    outExtension: { '.js': '.cjs' }
  })
  .catch(() => process.exit(1))
