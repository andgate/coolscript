/* eslint-disable @typescript-eslint/no-explicit-any */
import { codegenJS } from '@coolscript/codegen-js'

export type EvalJSResult = {
  value: any | null
  errors?: Error[]
}

function EvalJSFail(...errors: Error[]): EvalJSResult {
  return { value: null, errors }
}

function EvalJSSuccess(value: any): EvalJSResult {
  return { value }
}

function EvalJSFailedError(error: any): Error {
  let errorMsg = ''
  if (error && error.stack && error.message) {
    errorMsg = ` Error message: ${error.message}`
  }
  const msg = `Evaluation failed!${errorMsg}`
  return new Error(msg)
}

export function evalCS(textCS: string): EvalJSResult {
  const codegenResult = codegenJS(textCS)
  if (codegenResult.errors || !codegenResult.source) {
    return EvalJSFail(...codegenResult.errors)
  }

  const sourceJS = codegenResult.source
  let value: any = null
  try {
    // don't use direct eval https://esbuild.github.io/content-types/#direct-eval
    value = (0, eval)(sourceJS)
  } catch (e) {
    return EvalJSFail(EvalJSFailedError(e))
  }
  return EvalJSSuccess(value)
}
