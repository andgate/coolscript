import { useContext } from 'react'
import { media, style } from 'typestyle'
import * as csstips from 'csstips'
import { color, percent, px, viewHeight } from 'csx'
import { EditorContext } from '../contexts/EditorContext'

const editorTextAreaRoot = style(csstips.flex)

const editorTextArea = style(
  media({ maxWidth: px(699) }, { height: viewHeight(70) }),
  media({ minWidth: px(700) }, { height: viewHeight(90) }),
  {
    resize: 'none',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    width: percent(100),
    border: 'none',
    borderColor: color('#CCCCCC').toHexString(),
    borderStyle: 'solid'
  }
)

export function EditorTextArea() {
  const { editorState, setEditorState } = useContext(EditorContext)

  const onChange = (e) => {
    setEditorState({ textContent: e.target.value })
  }

  return (
    <div className={editorTextAreaRoot}>
      <textarea
        value={editorState.textContent}
        className={editorTextArea}
        onChange={onChange}></textarea>
    </div>
  )
}
