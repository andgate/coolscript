import { useContext, useMemo } from 'react'
import ReactJson from 'react-json-view'
import { evaluate } from '@coolscript/eval'
import { parse } from '@coolscript/parser'
import { style } from 'typestyle'
import * as csstips from 'csstips'
import { EditorContext } from '../contexts/EditorContext'

const consoleRoot = style(csstips.flex, {
  backgroundColor: '#FFFFFF',
  color: '#000000'
})

export function EditorConsole() {
  const { editorState } = useContext(EditorContext)
  const parseResult = useMemo(
    () => parse(editorState.textContent),
    [editorState]
  )
  const evalResult = useMemo(
    () => (parseResult ? evaluate(parseResult) : null),
    [parseResult]
  )
  const parseResultJSON = useMemo(
    () => JSON.stringify(parseResult),
    [parseResult]
  )
  const evalResultJSON = useMemo(() => JSON.stringify(evalResult), [evalResult])
  return (
    <div className={consoleRoot}>
      <div>
        {parseResult ? (
          <div>
            <h3>Parsed</h3>
            <ReactJson src={parseResult}></ReactJson>
          </div>
        ) : (
          <h1>Parsing failed.</h1>
        )}
      </div>
      <div>
        {evalResult ? (
          <div>
            <h3>Evaluated</h3>
            <ReactJson src={evalResult}></ReactJson>
          </div>
        ) : (
          <h3>Evaluation failed</h3>
        )}
      </div>
    </div>
  )
}
