import { createContext, useContext } from 'react'
import { PlaygroundAPI } from './PlaygroundAPI'

export const PlaygroundContext = createContext<PlaygroundAPI>(undefined)

export function usePlaygroundContext(): PlaygroundAPI {
  return useContext<PlaygroundAPI>(PlaygroundContext)
}
