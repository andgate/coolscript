import type { Term } from '@coolscript/syntax-concrete'
import * as astring from 'astring'
import type * as ES from 'estree'
import { ScriptBuilder } from './ScriptBuilder'

export function generateJS(term: Term): string {
  const builder: ScriptBuilder = new ScriptBuilder()
  const estree: ES.Program = builder.generate(term)
  return astring.generate(estree)
}
