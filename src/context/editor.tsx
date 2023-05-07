import type { JSX } from 'solid-js'
import { Accessor, createContext, createSignal, useContext } from 'solid-js'
import { createStore, SetStoreFunction } from 'solid-js/store'
import { Topic } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { useLocalize } from './localize'
import { useSnackbar } from './snackbar'

type WordCounter = {
  characters: number
  words: number
}

type ShoutForm = {
  shoutId: number
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
  formErrors: Partial<ShoutForm>
  actions: {
    saveShout: () => Promise<boolean>
    publishShout: () => Promise<boolean>
    toggleEditorPanel: () => void
    countWords: (value: WordCounter) => void
    setForm: SetStoreFunction<ShoutForm>
    setFormErrors: SetStoreFunction<Partial<ShoutForm>>
  }
}

const EditorContext = createContext<EditorContextType>()

export function useEditorContext() {
  return useContext(EditorContext)
}

export const EditorProvider = (props: { children: JSX.Element }) => {
  const { t } = useLocalize()
  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const [isEditorPanelVisible, setIsEditorPanelVisible] = createSignal<boolean>(false)

  const [form, setForm] = createStore<ShoutForm>(null)
  const [formErrors, setFormErrors] = createStore<Partial<ShoutForm>>(null)

  const [wordCounter, setWordCounter] = createSignal<WordCounter>({
    characters: 0,
    words: 0
  })

  const toggleEditorPanel = () => setIsEditorPanelVisible((value) => !value)
  const countWords = (value) => setWordCounter(value)

  const saveShout = async () => {
    if (!form.title) {
      setFormErrors('title', t('Required'))
      return false
    }

    try {
      await apiClient.updateArticle({
        shoutId: form.shoutId,
        shoutInput: {
          body: form.body,
          topics: form.selectedTopics.map((topic) => topic.slug),
          // authors?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
          // community?: InputMaybe<Scalars['Int']>
          mainTopic: form.selectedTopics[0]?.slug || 'society',
          slug: form.slug,
          subtitle: form.subtitle,
          title: form.title,
          cover: form.coverImageUrl
        }
      })
      return true
    } catch (error) {
      console.error(error)
      showSnackbar({ type: 'error', body: t('Error') })
      return false
    }
  }

  const publishShout = async () => {
    try {
      await apiClient.publishShout({
        slug: form.slug,
        shoutInput: {
          body: form.body,
          topics: form.selectedTopics.map((topic) => topic.slug),
          // authors?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
          // community?: InputMaybe<Scalars['Int']>
          mainTopic: form.selectedTopics[0]?.slug || '',
          slug: form.slug,
          subtitle: form.subtitle,
          title: form.title
        }
      })
      return true
    } catch {
      showSnackbar({ type: 'error', body: t('Error') })
      return false
    }
  }

  const actions = {
    saveShout,
    publishShout,
    toggleEditorPanel,
    countWords,
    setForm,
    setFormErrors
  }

  const value: EditorContextType = { actions, form, formErrors, isEditorPanelVisible, wordCounter }

  return <EditorContext.Provider value={value}>{props.children}</EditorContext.Provider>
}
