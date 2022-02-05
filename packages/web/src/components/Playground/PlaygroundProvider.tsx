import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  evaluateJavascript,
  JsEvalResult,
  PlaygroundResults,
  PlaygroundStore
} from './PlaygroundStore'
import { PlaygroundContext } from './PlaygroundContext'
import * as CoolScript from '@coolscript/parser'
import { generateJS, JsGenResult } from '@coolscript/backend-js'
import { EvalResult, evaluate } from '@coolscript/eval'
import { Term } from '@coolscript/syntax-concrete'
import { examples } from '@coolscript/examples'
import { ParseResult } from '@coolscript/parser'
import { PlaygroundAPI } from './PlaygroundAPI'

export const PlaygroundProvider = (props) => {
  const [results, setResults] = useState<PlaygroundResults>({})
  const [editorText, setEditorText] = useState<string>(examples.example1)
  const [scriptText, setScriptText] = useState<string>(null)

  const runScript: () => void = useCallback(
    () => setScriptText(editorText),
    [editorText]
  )

  useEffect(() => {
    const parseResult: ParseResult | null = scriptText
      ? CoolScript.parse(scriptText)
      : null

    const parseResultTerm: Term | null = parseResult ? parseResult.term : null

    const evalResult: EvalResult | null = parseResultTerm
      ? evaluate(parseResultTerm)
      : null

    const jsGenResult: JsGenResult | null = parseResultTerm
      ? generateJS(parseResultTerm)
      : null

    const jsEvalResult: JsEvalResult | null =
      jsGenResult && jsGenResult.source
        ? evaluateJavascript(jsGenResult.source)
        : null

    setResults({
      parse: parseResult,
      eval: evalResult,
      jsGen: jsGenResult,
      jsEval: jsEvalResult
    })
  }, [scriptText])

  const store = useMemo<PlaygroundStore>(() => {
    return { editorText, results }
  }, [editorText, results])

  const api: PlaygroundAPI = useMemo<PlaygroundAPI>(
    () => ({
      store,
      setEditorText,
      runScript
    }),
    [store, runScript]
  )

  return (
    <PlaygroundContext.Provider value={api}>
      {props.children}
    </PlaygroundContext.Provider>
  )
}
