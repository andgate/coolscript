import { style } from 'typestyle'
import { usePlaygroundStore } from '../PlaygroundContext'

const editorMenuBarRoot = style({})

export function EditorMenuBar() {
  const { runScript } = usePlaygroundStore()
  return (
    <div className={editorMenuBarRoot}>
      <button onClick={() => runScript()}>Run</button>
    </div>
  )
}
