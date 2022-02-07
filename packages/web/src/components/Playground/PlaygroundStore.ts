import type { CodegenJSResult } from '@coolscript/codegen-js'
import type { EvalResult } from '@coolscript/eval'
import type { EvalJSResult } from '@coolscript/eval-js'

export type PlaygroundStore = {
  codegenJSResult?: CodegenJSResult
  evalResult?: EvalResult
  evalJSResult?: EvalJSResult
  editorText: string
  setEditorText(text: string): void
  runScript(): void
}
