/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateJS } from '@coolscript/backend-js'
import { parse } from '@coolscript/parser'

export type CodegenJSResult = {
  source: string | null
  errors?: Error[]
}

function CodegenJSFail(...errors: Error[]): CodegenJSResult {
  return { source: null, errors }
}

function CodegenJSSuccess(source: any): CodegenJSResult {
  return { source }
}

export function codegenJS(textCS: string): CodegenJSResult {
  const ast = parse(textCS)
  if (ast.errors || !ast.term) {
    return CodegenJSFail(...ast.errors)
  }

  const textJS = generateJS(ast.term)
  if (textJS.errors || !textJS.source) {
    return CodegenJSFail(...textJS.errors)
  }
  return CodegenJSSuccess(textJS.source)
}
