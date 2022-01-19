import { Value } from '@coolscript/syntax'

export type ReturnValue = {
  value: Value | null
}

export function ReturnValue(): ReturnValue {
  return { value: null }
}
