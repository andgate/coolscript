import { style } from 'typestyle'
import { usePlaygroundContext } from '../PlaygroundContext'

const editorMenuBarRoot = style({})

export function EditorMenuBar() {
  const { runScript } = usePlaygroundContext()
  return (
    <div className={editorMenuBarRoot}>
      <button onClick={() => runScript()}>Run</button>
    </div>
  )
}
