/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateJS } from '@coolscript/backend-js'
import * as JS from '@coolscript/eval-js'
import * as Standard from '@coolscript/eval-standard'
import { Term, ValueTerm } from '@coolscript/syntax'

export type EvalResult = {
  value: any | null
  errors?: Error[]
}

export type EvalBackend = 'js' | 'standard'

export const defaultEvalBackend: EvalBackend = 'standard'

export type EvalOptions = {
  backend?: EvalBackend
}

function EvalFail(...errors: Error[]): EvalResult {
  return { value: null, errors }
}

function EvalSuccess(value: any): EvalResult {
  return { value }
}

export function evalCS(source: string, options: EvalOptions): EvalResult {
  const backend: EvalBackend = options.backend
    ? options.backend
    : defaultEvalBackend
  switch (backend) {
    case 'standard': {
      return standardEvalCS(source)
    }
    case 'js':
      return JS.evalCS(source)
  }
}

function standardEvalCS(source: string): EvalResult {
  const evalResult = Standard.evaluate(source)
  if (evalResult.errors || !evalResult.value) {
    return EvalFail(...evalResult.errors)
  }
  const value: Standard.HeapValue = evalResult.value
  const tm: Term = Standard.ValueToTerm(value)
  const jsResult = generateJS(tm)
  if (jsResult.errors || !jsResult.source) {
    return EvalFail(...jsResult.errors)
  }
  const js = jsResult.source
  let result = null
  try {
    // use indirect eval https://esbuild.github.io/content-types/#direct-eval
    result = (0, eval)(js)
  } catch (error) {
    return EvalFail(error)
  }
  return EvalSuccess(result)
}
