import { createContext, useState } from 'react'
import codeSample from 'bundle-text:../assets/sample.cool'

export const EditorContext = createContext()

export const EditorStateContextProvider = (props) => {
  const [editorState, setEditorState] = useState({
    textContent: codeSample
  })

  return (
    <EditorContext.Provider value={{ editorState, setEditorState }}>
      {props.children}
    </EditorContext.Provider>
  )
}
