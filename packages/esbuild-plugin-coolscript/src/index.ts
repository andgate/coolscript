import * as path from 'path'
import * as fs from 'fs'
import { Plugin, PluginBuild } from 'esbuild'
import { parse } from '@coolscript/parser'
import { generateJS, JsGenResult } from '@coolscript/backend-js'

function compileCoolScript(txt): string {
  const parseResult = parse(txt)
  if (Array.isArray(parseResult.errors)) {
    throw parseResult.errors
  }
  const jsGenResult = generateJS(parseResult.term)
  if (Array.isArray(jsGenResult.errors)) {
    throw jsGenResult.errors
  }
  return jsGenResult.source
}

export function CoolScriptPlugin(): Plugin {
  return {
    name: 'esbuild-plugin-coolscript',
    setup(build: PluginBuild) {
      build.onResolve({ filter: /^.*\.cool$/ }, (args) => ({
        path: path.resolve(args.resolveDir, args.path),
        namespace: 'coolscript'
      }))

      build.onLoad({ filter: /.*/, namespace: 'coolscript' }, async (args) => {
        const ns_path = args.path
        const txt = await fs.promises.readFile(ns_path, 'utf8')

        let contents = ''
        try {
          contents = compileCoolScript(txt)
        } catch (errors) {
          return {
            errors,
            resolveDir: path.dirname(ns_path),
            watchFiles: [ns_path]
          }
        }

        return {
          contents,
          loader: 'js',
          resolveDir: path.dirname(ns_path),
          watchFiles: [ns_path]
        }
      })
    }
  }
}

export default CoolScriptPlugin()
