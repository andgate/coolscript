import { media, style } from 'typestyle'
import * as csstips from 'csstips'
import { EditorTextArea } from './EditorTextArea'
import { px } from 'csx'
import { EditorStateContextProvider } from '../contexts/EditorContext'
import { OutputPanel } from './OutputPanel'

const editorRoot = style(
  csstips.fillParent,
  {
    paddingLeft: px(8),
    paddingRight: px(8)
  },
  media({ maxWidth: 699 }, csstips.vertical, csstips.verticallySpaced(px(8))),
  media(
    { minWidth: 700 },
    csstips.horizontal,
    csstips.horizontallySpaced(px(8))
  )
)

export function Editor() {
  return (
    <div className={editorRoot}>
      <EditorStateContextProvider>
        <EditorTextArea />
        <OutputPanel />
      </EditorStateContextProvider>
    </div>
  )
}
