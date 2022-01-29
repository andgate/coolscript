import type { ParseResult } from '@coolscript/parser'
import type { EvalResult } from '@coolscript/eval'
import type { JsGenResult } from '@coolscript/backend-js'

export type JsEvalResult = {
  value: object | null
  errors?: Error[]
}

export function evaluateJavascript(source: string): JsEvalResult {
  let value = null
  try {
    value = eval(source)
  } catch (e) {
    return { value, errors: [e] }
  }
  return { value }
}

export type PlaygroundResults = {
  parse?: ParseResult
  eval?: EvalResult
  jsGen?: JsGenResult
  jsEval?: JsEvalResult
}

export type PlaygroundStore = {
  editorText: string
  results: PlaygroundResults
}

export function PlaygroundStore(
  editorText: string,
  results: PlaygroundResults = {}
): PlaygroundStore {
  return { editorText, results }
}
