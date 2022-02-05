import * as csstips from 'csstips'
import { style } from 'typestyle'
import { Editor } from './Editor'
import { EditorMenuBar } from './EditorMenuBar'

const editorPanelRoot = style(csstips.flex1, csstips.vertical)
const editorPanelMenuBar = style(csstips.content)
const editorPanelBody = style(csstips.flex)

export function EditorPanel() {
  return (
    <div className={editorPanelRoot}>
      <div className={editorPanelMenuBar}>
        <EditorMenuBar />
      </div>
      <div className={editorPanelBody}>
        <Editor />
      </div>
    </div>
  )
}
