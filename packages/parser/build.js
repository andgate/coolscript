const process = require('process')
const esbuild = require('esbuild')
const NearleyPlugin = require('esbuild-plugin-nearley')

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
  minify: false,
  plugins: [NearleyPlugin.default],
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
