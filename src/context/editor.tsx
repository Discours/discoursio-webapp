import type { JSX } from 'solid-js'
import { Accessor, createContext, createSignal, useContext } from 'solid-js'
import { createStore, SetStoreFunction } from 'solid-js/store'
import { Topic } from '../graphql/types.gen'

type WordCounter = {
  characters: number
  words: number
}

type ShoutForm = {
  slug: string
  title: string
  subtitle: string
  selectedTopics: Topic[]
  mainTopic: string
  body: string
  coverImageUrl: string
}

type EditorContextType = {
  isEditorPanelVisible: Accessor<boolean>
  wordCounter: Accessor<WordCounter>
  form: ShoutForm
  actions: {
    toggleEditorPanel: () => void
    countWords: (value: WordCounter) => void
    setForm: SetStoreFunction<ShoutForm>
  }
}

const EditorContext = createContext<EditorContextType>()

export function useEditorContext() {
  return useContext(EditorContext)
}

export const EditorProvider = (props: { children: JSX.Element }) => {
  const [isEditorPanelVisible, setIsEditorPanelVisible] = createSignal<boolean>(false)

  const [form, setForm] = createStore<ShoutForm>(null)

  const [wordCounter, setWordCounter] = createSignal<WordCounter>({
    characters: 0,
    words: 0
  })
  const toggleEditorPanel = () => setIsEditorPanelVisible((value) => !value)
  const countWords = (value) => setWordCounter(value)
  const actions = {
    toggleEditorPanel,
    countWords,
    setForm
  }

  const value: EditorContextType = { actions, form, isEditorPanelVisible, wordCounter }

  return <EditorContext.Provider value={value}>{props.children}</EditorContext.Provider>
}
