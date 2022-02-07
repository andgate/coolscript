import { useCallback, useMemo, useState } from 'react'
import { PlaygroundContext } from './PlaygroundContext'
import { codegenJS, CodegenJSResult } from '@coolscript/codegen-js'
import { EvalResult, evaluate } from '@coolscript/eval'
import { EvalJSResult, evalCS } from '@coolscript/eval-js'
import { examples } from '@coolscript/examples'

export const PlaygroundProvider = (props) => {
  const [editorText, setEditorText] = useState<string>(examples.example1)
  const [scriptText, setScriptText] = useState<string>(null)

  const runScript: () => void = useCallback(
    () => setScriptText(editorText),
    [editorText]
  )

  const evalResult: EvalResult | null = useMemo(
    () => (scriptText ? evaluate(scriptText) : null),
    [scriptText]
  )

  const codegenJSResult: CodegenJSResult | null = useMemo(
    () => (scriptText ? codegenJS(scriptText) : null),
    [scriptText]
  )

  const evalJSResult: EvalJSResult | null = useMemo(
    () => (scriptText ? evalCS(scriptText) : null),
    [scriptText]
  )

  return (
    <PlaygroundContext.Provider
      value={{
        codegenJSResult,
        evalResult,
        evalJSResult,
        editorText,
        setEditorText,
        runScript
      }}>
      {props.children}
    </PlaygroundContext.Provider>
  )
}
