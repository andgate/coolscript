export * from './heap/HeapValue'

import { parse, ParseResult } from '@coolscript/parser'
import { Term } from '@coolscript/syntax'
import { HeapValue } from './heap/HeapValue'
import { Interpreter } from './Interpreter'

export type EvalResult = {
  value: HeapValue | null
  errors?: Error[]
}

function EvalFail(...errors: Error[]): EvalResult {
  return { value: null, errors }
}

function EvalSuccess(value: HeapValue): EvalResult {
  return { value }
}

function EvalFailedError(error: any): Error {
  let errorMsg = ''
  if (error && error.stack && error.message) {
    errorMsg = ` Error message: ${error.message}`
  }
  const msg = `Evaluation failed!${errorMsg}`
  return new Error(msg)
}

export function evaluate(source: string): EvalResult {
  let parseResult: ParseResult
  try {
    parseResult = parse(source)
  } catch (error) {
    return EvalFail(error)
  }
  if (parseResult.errors || !parseResult.term) {
    return EvalFail(...parseResult.errors)
  }

  return evaluateTerm(parseResult.term)
}

export function evaluateTerm(tm: Term): EvalResult {
  const interpreter = new Interpreter()
  let value: HeapValue
  try {
    value = interpreter.interpret(tm)
  } catch (e) {
    return EvalFail(EvalFailedError(e))
  }
  return EvalSuccess(value)
}
