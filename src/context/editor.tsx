import type { JSX } from 'solid-js'
import { Accessor, createContext, createSignal, useContext } from 'solid-js'
import { createStore, SetStoreFunction } from 'solid-js/store'
import { Topic, TopicInput } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { useLocalize } from './localize'
import { useSnackbar } from './snackbar'
import { openPage } from '@nanostores/router'
import { router, useRouter } from '../stores/router'
import { slugify } from '../utils/slugify'
import { Editor } from '@tiptap/core'

type WordCounter = {
  characters: number
  words: number
}

export type ShoutForm = {
  layout?: string
  shoutId: number
  slug: string
  title: string
  subtitle: string
  lead?: string
  description?: string
  selectedTopics: Topic[]
  mainTopic?: Topic
  body: string
  coverImageUrl: string
  media?: string
}

type EditorContextType = {
  isEditorPanelVisible: Accessor<boolean>
  wordCounter: Accessor<WordCounter>
  form: ShoutForm
  formErrors: Record<keyof ShoutForm, string>
  editorRef: { current: () => Editor }
  actions: {
    saveShout: (form: ShoutForm) => Promise<void>
    saveDraft: (form: ShoutForm) => Promise<void>
    saveDraftToLocalStorage: (form: ShoutForm) => void
    getDraftFromLocalStorage: (shoutId: number) => ShoutForm
    publishShout: (form: ShoutForm) => Promise<void>
    publishShoutById: (shoutId: number) => Promise<void>
    deleteShout: (shoutId: number) => Promise<boolean>
    toggleEditorPanel: () => void
    countWords: (value: WordCounter) => void
    setForm: SetStoreFunction<ShoutForm>
    setFormErrors: SetStoreFunction<Record<keyof ShoutForm, string>>
    setEditor: (editor: () => Editor) => void
  }
}

const EditorContext = createContext<EditorContextType>()

export function useEditorContext() {
  return useContext(EditorContext)
}

const topic2topicInput = (topic: Topic): TopicInput => {
  return {
    id: topic.id,
    slug: topic.slug,
    title: topic.title
  }
}

const saveDraftToLocalStorage = (formToSave: ShoutForm) => {
  localStorage.setItem(`shout-${formToSave.shoutId}`, JSON.stringify(formToSave))
}
const getDraftFromLocalStorage = (shoutId: number) => {
  return JSON.parse(localStorage.getItem(`shout-${shoutId}`))
}

const removeDraftFromLocalStorage = (shoutId: number) => {
  localStorage.removeItem(`shout-${shoutId}`)
}

export const EditorProvider = (props: { children: JSX.Element }) => {
  const { t } = useLocalize()

  const { page } = useRouter()

  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const [isEditorPanelVisible, setIsEditorPanelVisible] = createSignal<boolean>(false)

  const editorRef: { current: () => Editor } = { current: null }

  const [form, setForm] = createStore<ShoutForm>(null)
  const [formErrors, setFormErrors] = createStore<Record<keyof ShoutForm, string>>(null)

  const [wordCounter, setWordCounter] = createSignal<WordCounter>({
    characters: 0,
    words: 0
  })

  const toggleEditorPanel = () => setIsEditorPanelVisible((value) => !value)
  const countWords = (value) => setWordCounter(value)

  const validate = () => {
    if (!form.title) {
      setFormErrors('title', t('Required'))
      return false
    }

    const parsedMedia = JSON.parse(form.media)
    if (form.layout === 'video' && !parsedMedia[0]) {
      showSnackbar({ type: 'error', body: t('Looks like you forgot to upload the video') })
      return false
    }

    return true
  }

  const validateSettings = () => {
    if (form.selectedTopics.length === 0) {
      setFormErrors('selectedTopics', t('Required'))
      return false
    }

    return true
  }

  const updateShout = async (formToUpdate: ShoutForm, { publish }: { publish: boolean }) => {
    return apiClient.updateArticle({
      shoutId: formToUpdate.shoutId,
      shoutInput: {
        body: formToUpdate.body,
        topics: formToUpdate.selectedTopics.map((topic) => topic2topicInput(topic)),
        // authors?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
        // community?: InputMaybe<Scalars['Int']>
        mainTopic: topic2topicInput(formToUpdate.mainTopic),
        slug: formToUpdate.slug,
        subtitle: formToUpdate.subtitle,
        title: formToUpdate.title,
        // lead: formToUpdate.lead,
        // description: formToUpdate.description,
        cover: formToUpdate.coverImageUrl,
        media: formToUpdate.media
      },
      publish
    })
  }

  const saveShout = async (formToSave: ShoutForm) => {
    console.log('!!! formToSave:', formToSave)
    if (isEditorPanelVisible()) {
      toggleEditorPanel()
    }

    if (page().route === 'edit' && !validate()) {
      return
    }

    if (page().route === 'editSettings' && !validateSettings()) {
      return
    }

    try {
      const shout = await updateShout(formToSave, { publish: false })
      removeDraftFromLocalStorage(formToSave.shoutId)

      if (shout.visibility === 'owner') {
        openPage(router, 'drafts')
      } else {
        openPage(router, 'article', { slug: shout.slug })
      }
    } catch (error) {
      console.error('[saveShout]', error)
      showSnackbar({ type: 'error', body: t('Error') })
    }
  }

  const saveDraft = async (draftForm: ShoutForm) => {
    await updateShout(draftForm, { publish: false })
  }

  const publishShout = async (formToPublish: ShoutForm) => {
    if (isEditorPanelVisible()) {
      toggleEditorPanel()
    }

    if (page().route === 'edit') {
      if (!validate()) {
        return
      }

      await updateShout(formToPublish, { publish: false })

      const slug = slugify(form.title)
      setForm('slug', slug)
      openPage(router, 'editSettings', { shoutId: form.shoutId.toString() })
      return
    }

    if (!validateSettings()) {
      return
    }

    try {
      await updateShout(formToPublish, { publish: true })
      openPage(router, 'feed')
    } catch (error) {
      console.error('[publishShout]', error)
      showSnackbar({ type: 'error', body: t('Error') })
    }
  }

  const publishShoutById = async (shoutId: number) => {
    try {
      await apiClient.updateArticle({
        shoutId,
        publish: true
      })

      openPage(router, 'feed')
    } catch (error) {
      console.error('[publishShoutById]', error)
      showSnackbar({ type: 'error', body: t('Error') })
    }
  }

  const deleteShout = async (shoutId: number) => {
    try {
      await apiClient.deleteShout({
        shoutId
      })
      return true
    } catch {
      showSnackbar({ type: 'error', body: t('Error') })
      return false
    }
  }

  const setEditor = (editor: () => Editor) => {
    editorRef.current = editor
  }

  const actions = {
    saveShout,
    saveDraft,
    saveDraftToLocalStorage,
    getDraftFromLocalStorage,
    publishShout,
    publishShoutById,
    deleteShout,
    toggleEditorPanel,
    countWords,
    setForm,
    setFormErrors,
    setEditor
  }

  const value: EditorContextType = {
    actions,
    form,
    formErrors,
    editorRef,
    isEditorPanelVisible,
    wordCounter
  }

  return <EditorContext.Provider value={value}>{props.children}</EditorContext.Provider>
}
