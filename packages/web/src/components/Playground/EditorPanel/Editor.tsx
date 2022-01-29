import { useContext } from 'react'
import { media, style } from 'typestyle'
import * as csstips from 'csstips'
import { color, percent, px, viewHeight } from 'csx'
import { PlaygroundContext } from '../PlaygroundContext'

const editorRoot = style(csstips.flex)

const editorTextArea = style(
  media({ maxWidth: px(699) }, { height: viewHeight(70) }),
  media({ minWidth: px(700) }, { height: viewHeight(90) }),
  {
    resize: 'none',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    width: percent(100),
    borderColor: color('#CCCCCC').toHexString(),
    borderStyle: 'solid',
    borderWidth: px(1),
    outline: 'none'
  }
)

export function Editor() {
  const { store, setEditorText } = useContext(PlaygroundContext)

  const onChange = (e) => {
    setEditorText(e.target.value)
  }

  return (
    <div className={editorRoot}>
      <textarea
        value={store.editorText}
        className={editorTextArea}
        onChange={onChange}></textarea>
    </div>
  )
}
