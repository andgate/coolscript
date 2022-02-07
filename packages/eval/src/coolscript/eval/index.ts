import { parse } from '@coolscript/parser'
import { Term } from '@coolscript/syntax-concrete'
import { Value } from './Value'
export * from './Value'
import { Interpreter } from './Interpreter'

export type EvalResult = {
  value: Value | null
  errors?: Error[]
}

function EvalFail(...errors: Error[]): EvalResult {
  return { value: null, errors }
}

function EvalSuccess(value: Value): EvalResult {
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
  const parseResult = parse(source)
  if (parseResult.errors || !parseResult.term) {
    return EvalFail(...parseResult.errors)
  }

  return evaluateTerm(parseResult.term)
}

export function evaluateTerm(tm: Term): EvalResult {
  const interpreter = new Interpreter()
  let value: Value
  try {
    value = interpreter.interpret(tm)
  } catch (e) {
    return EvalFail(EvalFailedError(e))
  }
  return EvalSuccess(value)
}
