import { style } from 'typestyle'
import * as csstips from 'csstips'
import { EditorTextArea } from './EditorTextArea'
import { EditorConsole } from './EditorConsole'
import { px } from 'csx'
import { EditorStateContextProvider } from '../contexts/EditorContext'

const editorRoot = style(
  csstips.fillParent,
  csstips.horizontal,
  csstips.horizontallySpaced(px(8)),
  {
    paddingLeft: px(8),
    paddingRight: px(8)
  }
)

export function Editor() {
  return (
    <div className={editorRoot}>
      <EditorStateContextProvider>
        <EditorTextArea />
        <EditorConsole />
      </EditorStateContextProvider>
    </div>
  )
}
