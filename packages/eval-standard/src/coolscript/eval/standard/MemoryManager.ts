import { HeapScope } from './heap/HeapScope'
import { HeapSpace } from './heap/HeapSpace'
import { HeapValue } from './heap/HeapValue'
import { HeapId } from './heap/HeapId'

export class MemoryManager {
  heap: HeapSpace = new HeapSpace()
  currentScope: HeapScope = new HeapScope()
  scopeStack: HeapScope[] = []

  store(name: string, value: HeapValue): HeapId {
    let heapId = this.currentScope.resolve(name)
    if (heapId) {
      this.heap.update(heapId, value)
      return heapId
    }
    heapId = this.heap.put(value)
    this.currentScope.put(name, heapId)
    return heapId
  }

  resolve(name: string): HeapId | null {
    return this.currentScope.resolve(name)
  }

  load(name: string): HeapValue | null {
    return this.loadById(this.resolve(name))
  }

  loadById(id: HeapId): HeapValue | null {
    return this.heap.get(id)
  }

  enterScope() {
    const innerScope = new HeapScope(this.currentScope)
    this.currentScope = innerScope
  }

  exitScope() {
    const parentScope = this.currentScope.parent
    const outerScope = parentScope ? parentScope : new HeapScope()
    this.currentScope = outerScope
  }

  pushScope() {
    this.scopeStack.push(this.currentScope)
    this.currentScope = new HeapScope()
  }

  popScope() {
    let nextScope: HeapScope | undefined = this.scopeStack.pop()
    if (!nextScope) {
      nextScope = new HeapScope()
    }
    this.currentScope = nextScope
  }
}
