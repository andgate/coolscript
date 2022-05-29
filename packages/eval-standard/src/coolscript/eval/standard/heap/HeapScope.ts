import { HeapId } from './HeapId'

export class HeapScope {
  parent: HeapScope | null
  members: Map<string, HeapId> = new Map()

  constructor(parent?: HeapScope) {
    this.parent = parent
  }

  put(name: string, heapId: HeapId) {
    this.members.set(name, heapId)
  }

  resolve(name: string): HeapId | null {
    const localHeapId: HeapId | null = this.resolveLocal(name)
    if (localHeapId) {
      return localHeapId
    }
    return this.resolveOuter(name)
  }

  resolveLocal(name: string): HeapId | null {
    return this.members.get(name)
  }

  resolveOuter(name: string): HeapId | null {
    let parent: HeapScope | null = this.parent
    while (parent != null) {
      if (parent.members.has(name)) {
        return parent.members.get(name)
      }

      parent = parent.parent
    }
    return null
  }
}
