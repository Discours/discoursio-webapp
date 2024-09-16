import { Editor } from '@tiptap/core'
import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Meta, StoryObj } from 'storybook-solidjs'
import { EditorContext, EditorContextType, ShoutForm } from '~/context/editor'
import { LocalizeContext, LocalizeContextType } from '~/context/localize'
import { SessionContext, SessionContextType } from '~/context/session'
import { SnackbarContext, SnackbarContextType } from '~/context/ui'
import { EditorComponent, EditorComponentProps } from './Editor'

// Mock any necessary data
const mockSession = {
  session: () => ({
    user: {
      app_data: {
        profile: {
          name: 'Test User',
          slug: 'test-user'
        }
      }
    },
    access_token: 'mock-access-token'
  })
}

const mockLocalize = {
  t: (key: string) => key,
  lang: () => 'en'
}

const [_form, setForm] = createStore<ShoutForm>({
  body: '',
  slug: '',
  shoutId: 0,
  title: '',
  selectedTopics: []
})
const [_formErrors, setFormErrors] = createStore({} as Record<keyof ShoutForm, string>)
const [editor, setEditor] = createSignal<Editor | undefined>()
const mockEditorContext: EditorContextType = {
  countWords: () => 0,
  isEditorPanelVisible: (): boolean => {
    throw new Error('Function not implemented.')
  },
  wordCounter: (): { characters: number; words: number } => {
    throw new Error('Function not implemented.')
  },
  form: {
    layout: undefined,
    shoutId: 0,
    slug: '',
    title: '',
    subtitle: undefined,
    lead: undefined,
    description: undefined,
    selectedTopics: [],
    mainTopic: undefined,
    body: '',
    coverImageUrl: undefined,
    media: undefined
  },
  formErrors: {} as Record<keyof ShoutForm, string>,
  setEditor,
  editor,
  saveShout: (_form: ShoutForm): Promise<void> => {
    throw new Error('Function not implemented.')
  },
  saveDraft: (_form: ShoutForm): Promise<void> => {
    throw new Error('Function not implemented.')
  },
  saveDraftToLocalStorage: (_form: ShoutForm): void => {
    throw new Error('Function not implemented.')
  },
  getDraftFromLocalStorage: (_shoutId: number): ShoutForm => {
    throw new Error('Function not implemented.')
  },
  publishShout: (_form: ShoutForm): Promise<void> => {
    throw new Error('Function not implemented.')
  },
  publishShoutById: (_shoutId: number): Promise<void> => {
    throw new Error('Function not implemented.')
  },
  deleteShout: (_shoutId: number): Promise<boolean> => {
    throw new Error('Function not implemented.')
  },
  toggleEditorPanel: (): void => {
    throw new Error('Function not implemented.')
  },
  setForm,
  setFormErrors
}

const mockSnackbarContext = {
  showSnackbar: console.log
}

const meta: Meta<typeof EditorComponent> = {
  title: 'Components/Editor',
  component: EditorComponent,
  argTypes: {
    shoutId: {
      control: 'number',
      description: 'Unique identifier for the shout (document)',
      defaultValue: 1
    },
    initialContent: {
      control: 'text',
      description: 'Initial content for the editor',
      defaultValue: ''
    },
    onChange: {
      action: 'contentChanged',
      description: 'Callback when the content changes'
    },
    disableCollaboration: {
      control: 'boolean',
      description: 'Disable collaboration features for Storybook',
      defaultValue: true
    }
  }
}

export default meta

type Story = StoryObj<typeof EditorComponent>

export const Default: Story = {
  render: (props: EditorComponentProps) => {
    const [_content, setContent] = createSignal(props.initialContent || '')

    return (
      <SessionContext.Provider value={mockSession as SessionContextType}>
        <LocalizeContext.Provider value={mockLocalize as LocalizeContextType}>
          <SnackbarContext.Provider value={mockSnackbarContext as SnackbarContextType}>
            <EditorContext.Provider value={mockEditorContext as EditorContextType}>
              <EditorComponent
                {...props}
                onChange={(text: string) => {
                  props.onChange(text)
                  setContent(text)
                }}
              />
            </EditorContext.Provider>
          </SnackbarContext.Provider>
        </LocalizeContext.Provider>
      </SessionContext.Provider>
    )
  },
  args: {
    shoutId: 1,
    initialContent: '',
    disableCollaboration: true
  }
}

export const WithInitialContent: Story = {
  ...Default,
  args: {
    ...Default.args,
    initialContent: '<p>This is some initial content in the editor.</p>'
  }
}
