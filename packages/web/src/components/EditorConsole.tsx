import { useContext } from 'react'
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
  return <div className={consoleRoot}>{parse(editorState.textContent).tag}</div>
}
