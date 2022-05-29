import type { Term } from '@coolscript/syntax'
import * as astring from 'astring'
import type * as ES from 'estree'
import { ScriptBuilder } from './ScriptBuilder'

export type JsGenResult = {
  source: string | null
  errors?: Error[]
}

function JsGenFail(...errors: Error[]): JsGenResult {
  return { source: null, errors }
}

function JsGenSuccess(source: string): JsGenResult {
  return { source }
}

export function generateJS(term: Term): JsGenResult {
  let js: string
  try {
    const builder: ScriptBuilder = new ScriptBuilder()
    const estree: ES.Program = builder.generate(term)
    js = astring.generate(estree)
  } catch (e) {
    return JsGenFail(e)
  }
  return JsGenSuccess(js)
}
