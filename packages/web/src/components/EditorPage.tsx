import { Header } from './Header'
import * as csstips from 'csstips'
import { style } from 'typestyle'
import { Editor } from './Editor'

const editorPageRoot = style(csstips.fillParent, csstips.vertical)
const editorPageHeader = style(csstips.content)
const editorPageBody = style(csstips.flex)

export function EditorPage() {
  return (
    <div className={editorPageRoot}>
      <div className={editorPageHeader}>
        <Header />
      </div>
      <div className={editorPageBody}>
        <Editor />
      </div>
    </div>
  )
}
