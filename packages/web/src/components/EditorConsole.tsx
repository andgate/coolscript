import { useContext, useMemo } from 'react'
import { evalcs } from '@coolscript/eval'
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
    () => (parseResult ? evalcs(parseResult) : null),
    [parseResult]
  )
  return (
    <div className={consoleRoot}>
      <div>
        {parseResult ? (
          <div>
            <h3>Parsed</h3>
            <div>{JSON.stringify(parseResult)}</div>
          </div>
        ) : (
          <h1>Parsing failed.</h1>
        )}
      </div>
      <div>
        {evalResult ? (
          <div>
            <h3>Evaluated</h3>
            <div>{JSON.stringify(evalResult)}</div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
