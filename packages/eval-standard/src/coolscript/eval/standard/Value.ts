import * as Core from '@coolscript/syntax'
import * as Scoped from '@coolscript/syntax-scoped'

export type Variable = Core.Variable
export type ObjectMap<T> = Core.ObjectMap<T>

// Values
export type Value =
  | AtomicValue
  | LambdaValue
  | ArrayValue
  | ObjectValue
  | ErrorValue

export type AtomicValue = Core.AtomicValue<{}>
export type NullValue = Core.NullValue<{}>
export type NumberValue = Core.NumberValue<{}>
export type StringValue = Core.StringValue<{}>
export type BooleanValue = Core.BooleanValue<{}>

export type LambdaValue = {
  tag: 'LambdaValue'
  args: Array<Variable>
  body: Scoped.Term
}

export type ArrayValue = {
  tag: 'ArrayValue'
  elements: Array<Value>
}

export type ObjectValue = {
  tag: 'ObjectValue'
  entries: ObjectMap<Value>
}

export type ErrorValue = {
  tag: 'ErrorValue'
  err: string
}

export function NullValue(): NullValue {
  return Core.NullValue({})
}

export function NumberValue(num: number): NumberValue {
  return Core.NumberValue(num, {})
}

export function StringValue(str: string): StringValue {
  return Core.StringValue(str, {})
}

export function BooleanValue(bool: boolean): BooleanValue {
  return Core.BooleanValue(bool, {})
}

export function LambdaValue(
  args: Array<Variable>,
  body: Scoped.Term
): LambdaValue {
  return { tag: 'LambdaValue', args, body }
}

export function ArrayValue(elements: Array<Value>): ArrayValue {
  return { tag: 'ArrayValue', elements }
}

export function ObjectValue(entries: ObjectMap<Value>): ObjectValue {
  return { tag: 'ObjectValue', entries }
}

export function ErrorValue(err: string): ErrorValue {
  return { tag: 'ErrorValue', err }
}

export function ValueToTerm(value: Value): Core.Term<unknown> {
  switch (value.tag) {
    case 'NullValue':
    case 'BooleanValue':
    case 'NumberValue':
    case 'StringValue':
      return Core.ValueTerm(value, {})
    case 'ArrayValue': {
      const elements = value.elements.map((v) => ValueToTerm(v))
      return Core.ArrayTerm(elements, {})
    }
    case 'ObjectValue': {
      const entries = Object.entries(value.entries).map(([k, v]) => [
        k,
        ValueToTerm(v)
      ])
      const objectMap = Object.fromEntries(entries)
      return Core.ObjectTerm(objectMap, {})
    }
    case 'LambdaValue': {
      const args = value.args
      const body: Core.Term<unknown> = value.body as Core.Term<unknown>
      return Core.LambdaTerm(args, body, {})
    }
    case 'ErrorValue':
      return Core.ErrorTerm(value.err, {})
  }
}
