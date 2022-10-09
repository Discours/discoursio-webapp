import { createContext, useContext } from 'solid-js'
import type { Store } from 'solid-js/store'
import type { XmlFragment } from 'yjs'
import type { WebrtcProvider } from 'y-webrtc'
import type { ProseMirrorExtension, ProseMirrorState } from '../prosemirror/helpers'
import type { EditorView } from 'prosemirror-view'
import { createEmptyText } from '../prosemirror/setup'

export interface Args {
  draft: string // path to draft
  cwd?: string
  file?: string
  room?: string
  text?: string
}

export interface PrettierConfig {
  printWidth: number
  tabWidth: number
  useTabs: boolean
  semi: boolean
  singleQuote: boolean
}

export interface Config {
  theme: string
  // codeTheme: string;
  font: string
  fontSize: number
  contentWidth: number
  alwaysOnTop: boolean
  // typewriterMode: boolean;
  prettier: PrettierConfig
}

export interface ErrorObject {
  id: string
  props?: unknown
}

export interface YOptions {
  type: XmlFragment
  provider: WebrtcProvider
}

export interface Collab {
  started?: boolean
  error?: boolean
  room?: string
  y?: YOptions
}

export type LoadingType = 'loading' | 'initialized'

export interface State {
  text?: ProseMirrorState
  editorView?: EditorView
  extensions?: ProseMirrorExtension[]
  markdown?: boolean
  lastModified?: Date
  drafts: Draft[]
  config: Config
  error?: ErrorObject
  loading: LoadingType
  collab?: Collab
  path?: string
  args?: Args
}

export interface Draft {
  extensions?: ProseMirrorExtension[]
  lastModified: Date
  body?: string
  text?: { doc: any; selection: { type: string; anchor: number; head: number } }
  path?: string
  markdown?: boolean
}

export class ServiceError extends Error {
  public errorObject: ErrorObject
  constructor(id: string, props: unknown) {
    super(id)
    this.errorObject = { id, props }
  }
}

export const StateContext = createContext<[Store<State>, any]>([undefined, undefined])

export const useState = () => useContext(StateContext)

export const newState = (props: Partial<State> = {}): State => ({
  extensions: [],
  drafts: [],
  loading: 'loading',
  markdown: false,
  config: {
    theme: undefined,
    // codeTheme: 'material-light',
    font: 'muller',
    fontSize: 24,
    contentWidth: 800,
    alwaysOnTop: false,
    // typewriterMode: true,
    prettier: {
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: false,
      singleQuote: true
    }
  },
  ...props
})

export const addToDrafts = (drafts: Draft[], state: State): Draft[] => {
  drafts.forEach((d) => {
    if (!state.drafts.includes(d)) state.drafts.push(d)
  })
  return state.drafts
}

export const createTextFromDraft = async (draft: Draft) => {
  const created = createEmptyText()
  created.doc.content = Object.values(draft.text) // FIXME
  return created
}
