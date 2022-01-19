import { Value } from '@coolscript/syntax'

export class MemorySpace {
  members: Map<string, Value> = new Map()

  get(id: string): Value {
    return this.members.get(id)
  }

  put(id: string, value: Value) {
    this.members.set(id, value)
  }
}
