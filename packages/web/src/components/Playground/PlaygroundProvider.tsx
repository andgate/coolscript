import { useCallback, useState } from 'react'
import { PlaygroundContext } from './PlaygroundContext'
import { examples } from '@coolscript/examples'

export const PlaygroundProvider = (props) => {
  const [editorText, setEditorText] = useState<string>(examples.example1)
  const [scriptText, setScriptText] = useState<string>(null)

  const runScript: () => void = useCallback(
    () => setScriptText(editorText),
    [editorText]
  )

  return (
    <PlaygroundContext.Provider
      value={{
        editorText,
        setEditorText,
        scriptText,
        runScript
      }}>
      {props.children}
    </PlaygroundContext.Provider>
  )
}
