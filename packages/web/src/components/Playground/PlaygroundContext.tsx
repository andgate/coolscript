import { createContext, useContext } from 'react'
import { PlaygroundStore } from './PlaygroundStore'

export const PlaygroundContext = createContext<PlaygroundStore>(undefined)

export function usePlaygroundStore(): PlaygroundStore {
  return useContext<PlaygroundStore>(PlaygroundContext)
}
