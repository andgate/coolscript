import type { SymbolCS } from './SymbolCS'

export type Scoped = { scope: Scope }

export class Scope {
  enclosingScope: Scope | null
  symbols: Map<string, SymbolCS> = new Map()

  constructor(enclosingScope: Scope = null) {
    this.enclosingScope = enclosingScope
  }

  resolve(id: string): SymbolCS | null {
    // check this scope
    const s = this.symbols.get(id)
    if (s) {
      return s
    }
    // not here, check enclosing scope
    if (this.enclosingScope) {
      return this.enclosingScope.resolve(id)
    }
    return null // not found
  }

  define(sym: SymbolCS) {
    this.symbols.set(sym.id, sym)
    sym.scope = this // track scope in each symbol
  }

  getEnclosingScope() {
    return this.enclosingScope
  }
}
