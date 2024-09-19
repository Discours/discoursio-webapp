import { Editor, EditorOptions } from '@tiptap/core'
import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Meta, StoryObj } from 'storybook-solidjs'
import { EditorContext, EditorContextType, ShoutForm } from '~/context/editor'
import { LocalizeContext, LocalizeContextType } from '~/context/localize'
import { SessionContext, SessionContextType } from '~/context/session'
import { SnackbarContext, SnackbarContextType } from '~/context/ui'
import { EditorComponent, EditorComponentProps } from './Editor'

// Mock data
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
  isEditorPanelVisible: () => false,
  wordCounter: () => ({ characters: 0, words: 0 }),
  form: _form,
  formErrors: _formErrors,
  createEditor: (opts?: Partial<EditorOptions>) => {
    const newEditor = new Editor(opts)
    setEditor(newEditor)
    return newEditor
  },
  editor,
  saveShout: async (_form: ShoutForm) => {
    // Simulate save
  },
  saveDraft: async (_form: ShoutForm) => {
    // Simulate save draft
  },
  saveDraftToLocalStorage: (_form: ShoutForm) => {
    // Simulate save to local storage
  },
  getDraftFromLocalStorage: (_shoutId: number): ShoutForm => _form,
  publishShout: async (_form: ShoutForm) => {
    // Simulate publish
  },
  publishShoutById: async (_shoutId: number) => {
    // Simulate publish by ID
  },
  deleteShout: async (_shoutId: number): Promise<boolean> => true,
  toggleEditorPanel: () => {
    // Simulate toggle
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
