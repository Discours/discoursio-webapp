import type { JSX } from 'solid-js'

import { useMatch, useNavigate } from '@solidjs/router'
import { Editor } from '@tiptap/core'
import { Accessor, createContext, createSignal, useContext } from 'solid-js'
import { SetStoreFunction, createStore } from 'solid-js/store'
import { useSnackbar } from '~/context/ui'
import deleteShoutQuery from '~/graphql/mutation/core/article-delete'
import updateShoutQuery from '~/graphql/mutation/core/article-update'
import { Topic, TopicInput } from '~/graphql/schema/core.gen'
import { useFeed } from '../context/feed'
import { slugify } from '../utils/slugify'
import { useGraphQL } from './graphql'
import { useLocalize } from './localize'

type WordCounter = {
  characters: number
  words: number
}

export type ShoutForm = {
  layout?: string
  shoutId: number
  slug: string
  title: string
  subtitle?: string
  lead?: string
  description?: string
  selectedTopics: Topic[]
  mainTopic?: Topic
  body: string
  coverImageUrl?: string
  media?: string
}

type EditorContextType = {
  isEditorPanelVisible: Accessor<boolean>
  wordCounter: Accessor<WordCounter>
  form: ShoutForm
  formErrors: Record<keyof ShoutForm, string>
  editor: Accessor<Editor | undefined>
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
  setEditor: (editor: Editor) => void
}

const EditorContext = createContext<EditorContextType>({ editor: () => new Editor() } as EditorContextType)

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
  return JSON.parse(localStorage.getItem(`shout-${shoutId}`) || '{}')
}

const removeDraftFromLocalStorage = (shoutId: number) => {
  localStorage.removeItem(`shout-${shoutId}`)
}

export const EditorProvider = (props: { children: JSX.Element }) => {
  const localize = useLocalize()
  const navigate = useNavigate()
  const matchEdit = useMatch(() => '/edit')
  const matchEditSettings = useMatch(() => '/editSettings')
  const { mutation } = useGraphQL()
  const { addFeed } = useFeed()
  const snackbar = useSnackbar()
  const [isEditorPanelVisible, setIsEditorPanelVisible] = createSignal<boolean>(false)
  const [editor, setEditor] = createSignal<Editor>()
  const [form, setForm] = createStore<ShoutForm>({
    body: '',
    slug: '',
    shoutId: 0,
    title: '',
    selectedTopics: []
  })
  const [formErrors, setFormErrors] = createStore({} as Record<keyof ShoutForm, string>)
  const [wordCounter, setWordCounter] = createSignal<WordCounter>({
    characters: 0,
    words: 0
  })
  const toggleEditorPanel = () => setIsEditorPanelVisible((value) => !value)
  const countWords = (value: WordCounter) => setWordCounter(value)
  const validate = () => {
    if (!form.title) {
      setFormErrors('title', localize?.t('Please, set the article title') || '')
      return false
    }

    const parsedMedia = JSON.parse(form.media || '[]')
    if (form.layout === 'video' && !parsedMedia[0]) {
      snackbar?.showSnackbar({
        type: 'error',
        body: localize?.t('Looks like you forgot to upload the video')
      })
      return false
    }

    return true
  }

  const validateSettings = () => {
    if (form.selectedTopics.length === 0) {
      setFormErrors('selectedTopics', localize?.t('Required') || '')
      return false
    }

    return true
  }

  const updateShout = async (formToUpdate: ShoutForm, { publish }: { publish: boolean }) => {
    if (!formToUpdate.shoutId) {
      console.error(formToUpdate)
      return { error: 'not enought data' }
    }
    const resp = await mutation(updateShoutQuery, {
      shout_id: formToUpdate.shoutId,
      shout_input: {
        body: formToUpdate.body,
        topics: formToUpdate.selectedTopics.map((topic) => topic2topicInput(topic)), // NOTE: first is main
        // authors?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
        // community?: InputMaybe<Scalars['Int']>
        // mainTopic: topic2topicInput(formToUpdate.mainTopic),
        slug: formToUpdate.slug,
        subtitle: formToUpdate.subtitle,
        title: formToUpdate.title,
        lead: formToUpdate.lead,
        description: formToUpdate.description,
        cover: formToUpdate.coverImageUrl,
        media: formToUpdate.media
      },
      publish
    })
    return resp?.data?.update_shout
  }

  const saveShout = async (formToSave: ShoutForm) => {
    if (isEditorPanelVisible()) {
      toggleEditorPanel()
    }

    if (matchEdit() && !validate()) {
      return
    }

    if (matchEditSettings() && !validateSettings()) {
      return
    }

    try {
      const { shout, error } = await updateShout(formToSave, { publish: false })
      if (error) {
        snackbar?.showSnackbar({ type: 'error', body: localize?.t(error) || '' })
        return
      }
      removeDraftFromLocalStorage(formToSave.shoutId)

      if (shout?.published_at) {
        navigate(`/article/${shout.slug}`)
      } else {
        navigate('/edit')
      }
    } catch (error) {
      console.error('[saveShout]', error)
      snackbar?.showSnackbar({ type: 'error', body: localize?.t('Error') || '' })
    }
  }

  const saveDraft = async (draftForm: ShoutForm) => {
    const { error } = await updateShout(draftForm, { publish: false })
    if (error) {
      snackbar?.showSnackbar({ type: 'error', body: localize?.t(error) || '' })
      return
    }
  }

  const publishShout = async (formToPublish: ShoutForm) => {
    if (isEditorPanelVisible()) {
      toggleEditorPanel()
    }

    if (matchEdit()) {
      if (!validate()) return

      const slug = slugify(form.title)
      setForm('slug', slug)
      navigate(`/edit/${form.shoutId}/settings`)
      const { error } = await updateShout(formToPublish, { publish: false })
      if (error) {
        snackbar?.showSnackbar({ type: 'error', body: localize?.t(error) || '' })
      }
      return
    }

    if (!validateSettings()) {
      return
    }

    try {
      const { error } = await updateShout(formToPublish, { publish: true })
      if (error) {
        snackbar?.showSnackbar({ type: 'error', body: localize?.t(error) || '' })
        return
      }
      navigate('/feed')
    } catch (error) {
      console.error('[publishShout]', error)
      snackbar?.showSnackbar({ type: 'error', body: localize?.t('Error') || '' })
    }
  }

  const publishShoutById = async (shout_id: number) => {
    if (!shout_id) {
      console.error(`shout_id is ${shout_id}`)
      return
    }
    try {
      const resp = await mutation(updateShoutQuery, { shout_id, publish: true }).toPromise()
      const result = resp?.data?.update_shout
      if (result) {
        const { shout: newShout, error } = result
        if (error) {
          console.error(error)
          snackbar?.showSnackbar({ type: 'error', body: error })
          return
        }
        if (newShout) {
          addFeed([newShout])
          navigate('/feed')
        } else {
          console.error('[publishShoutById] no shout returned:', newShout)
        }
      }
    } catch (error) {
      console.error('[publishShoutById]', error)
      snackbar?.showSnackbar({ type: 'error', body: localize?.t('Error') })
    }
  }

  const deleteShout = async (shout_id: number) => {
    try {
      const resp = await mutation(deleteShoutQuery, { shout_id }).toPromise()
      return resp?.data?.delete_shout
    } catch {
      snackbar?.showSnackbar({ type: 'error', body: localize?.t('Error') || '' })
      return false
    }
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
    ...actions,
    form,
    formErrors,
    editor,
    isEditorPanelVisible,
    wordCounter
  }

  return <EditorContext.Provider value={value}>{props.children}</EditorContext.Provider>
}
