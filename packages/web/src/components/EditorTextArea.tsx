import { useContext } from 'react'
import { style } from 'typestyle'
import * as csstips from 'csstips'
import { percent, viewHeight } from 'csx'
import { EditorContext } from '../contexts/EditorContext'

const editorTextAreaRoot = style(csstips.flex, csstips.height(viewHeight(70)))

const editorTextArea = style(
  csstips.fillParent,
  csstips.height(viewHeight(70)),
  {
    resize: 'none',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    width: percent(100),
    border: 'none'
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
