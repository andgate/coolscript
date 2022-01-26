import type { Scope } from './Scope'

export type SymbolCS = {
  id: string
  scope: Scope
}

export function SymbolCS(id: string, scope: Scope) {
  return { id, scope }
}
