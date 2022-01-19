import { Term, Value } from '@coolscript/syntax'
import { Interpreter } from './Interpreter'

export function evaluate(tm: Term): Value {
  const interpreter = new Interpreter()
  return interpreter.interpret(tm)
}
