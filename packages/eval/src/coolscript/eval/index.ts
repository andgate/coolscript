import { Term } from '@coolscript/syntax-concrete'
import { Value } from './Value'
import { Interpreter } from './Interpreter'

export function evaluate(tm: Term): Value {
  const interpreter = new Interpreter()
  return interpreter.interpret(tm)
}
