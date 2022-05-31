import type { HeapId } from './HeapId'
import type { HeapValue } from './HeapValue'

export type HeapStore = Map<HeapId, HeapValue>

export class HeapSpace {
  store: HeapStore = new Map()
  fresh = 1

  get(id: HeapId): HeapValue | null {
    return this.store.get(id)
  }

  put(value: HeapValue): HeapId {
    const freshId: HeapId = 0 + this.fresh++
    this.store.set(freshId, value)
    return freshId
  }

  update(id: HeapId, value: HeapValue) {
    this.store.set(id, value)
    return id
  }

  remove(id: HeapId) {
    this.store.delete(id)
  }
}
