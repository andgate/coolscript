import * as path from 'path'
import * as fs from 'fs'
import { Plugin, PluginBuild } from 'esbuild'
import { parse } from '@coolscript/parser'
import { generateJS } from '@coolscript/backend-js'

function compileCoolScript(txt): string {
  const term = parse(txt)
  return generateJS(term)
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
        } catch (e) {
          return {
            errors: [{ text: e.message }],
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
