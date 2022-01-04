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
  const consoleOutput = JSON.stringify(parse(editorState.textContent))
  return <div className={consoleRoot}>{consoleOutput}</div>
}
