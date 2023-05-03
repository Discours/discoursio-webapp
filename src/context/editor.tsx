import type { JSX } from 'solid-js'
import { Accessor, createContext, createSignal, useContext } from 'solid-js'

type WordCounter = {
  characters: number
  words: number
}

type EditorContextType = {
  isEditorPanelVisible: Accessor<boolean>
  wordCounter: Accessor<WordCounter>
  actions: {
    toggleEditorPanel: () => void
    countWords: (value: WordCounter) => void
  }
}

const EditorContext = createContext<EditorContextType>()

export function useEditorContext() {
  return useContext(EditorContext)
}

export const EditorProvider = (props: { children: JSX.Element }) => {
  const [isEditorPanelVisible, setIsEditorPanelVisible] = createSignal<boolean>(false)
  const [wordCounter, setWordCounter] = createSignal<WordCounter>({
    characters: 0,
    words: 0
  })
  const toggleEditorPanel = () => setIsEditorPanelVisible((value) => !value)
  const countWords = (value) => setWordCounter(value)
  const actions = {
    toggleEditorPanel,
    countWords
  }

  const value: EditorContextType = { actions, isEditorPanelVisible, wordCounter }

  return <EditorContext.Provider value={value}>{props.children}</EditorContext.Provider>
}
