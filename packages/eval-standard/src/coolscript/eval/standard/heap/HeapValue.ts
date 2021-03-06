import * as Syntax from '@coolscript/syntax'
import type { HeapId } from './HeapId'

export type Variable = Syntax.Variable
export type ObjectMap<T> = Syntax.ObjectMap<T>
export type HeapClosure = [string, HeapId][]

export type HeapValue =
  | AtomicValue
  | ReferenceValue
  | LambdaValue
  | ArrayValue
  | ObjectValue
  | ErrorValue

export type AtomicValue = Syntax.AtomicValue
export type NullValue = Syntax.NullValue
export type NumberValue = Syntax.NumberValue
export type StringValue = Syntax.StringValue
export type BooleanValue = Syntax.BooleanValue

export type ReferenceValue = {
  tag: 'ReferenceValue'
  heapId: HeapId
}

export type LambdaValue = {
  tag: 'LambdaValue'
  closure: HeapClosure
  args: Array<Variable>
  body: Syntax.Term
}

export type ArrayValue = {
  tag: 'ArrayValue'
  elements: Array<HeapValue>
}

export type ObjectValue = {
  tag: 'ObjectValue'
  entries: ObjectMap<HeapValue>
}

export type ErrorValue = {
  tag: 'ErrorValue'
  err: string
}

export function NullValue(): NullValue {
  return Syntax.NullValue()
}

export function NumberValue(num: number): NumberValue {
  return Syntax.NumberValue(num)
}

export function StringValue(str: string): StringValue {
  return Syntax.StringValue(str)
}

export function BooleanValue(bool: boolean): BooleanValue {
  return Syntax.BooleanValue(bool)
}

export function ReferenceValue(heapId: HeapId): ReferenceValue {
  return { tag: 'ReferenceValue', heapId }
}

export function LambdaValue(
  closure: HeapClosure,
  args: Array<Variable>,
  body: Syntax.Term
): LambdaValue {
  return { tag: 'LambdaValue', closure, args, body }
}

export function ArrayValue(elements: Array<HeapValue>): ArrayValue {
  return { tag: 'ArrayValue', elements }
}

export function ObjectValue(entries: ObjectMap<HeapValue>): ObjectValue {
  return { tag: 'ObjectValue', entries }
}

export function ErrorValue(err: string): ErrorValue {
  return { tag: 'ErrorValue', err }
}

export function ValueToTerm(value: HeapValue): Syntax.Term {
  switch (value.tag) {
    case 'NullValue':
    case 'BooleanValue':
    case 'NumberValue':
    case 'StringValue':
      return Syntax.ValueTerm(value)
    case 'ArrayValue': {
      const elements = value.elements.map((v) => ValueToTerm(v))
      return Syntax.ArrayTerm(elements)
    }
    case 'ObjectValue': {
      const entries = Object.entries(value.entries).map(([k, v]) => [
        k,
        ValueToTerm(v)
      ])
      const objectMap = Object.fromEntries(entries)
      return Syntax.ObjectTerm(objectMap)
    }
    case 'LambdaValue': {
      const args = value.args
      const body: Syntax.Term = value.body as Syntax.Term
      return Syntax.LambdaTerm(args, body)
    }
    case 'ErrorValue':
      return Syntax.ErrorTerm(value.err)
  }
}
