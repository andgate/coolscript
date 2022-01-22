import { createContext, useState } from 'react'
import codeSample from '../assets/sample.cool'

export type EditorState = {
  textContent: string
}

export type EditorContext = {
  editorState: EditorState
  setEditorState: (s: EditorState) => void
}

export const EditorContext = createContext<EditorContext>(undefined)

export const EditorStateContextProvider = (props) => {
  const [editorState, setEditorState] = useState<EditorState>({
    textContent: codeSample
  })

  return (
    <EditorContext.Provider value={{ editorState, setEditorState }}>
      {props.children}
    </EditorContext.Provider>
  )
}
