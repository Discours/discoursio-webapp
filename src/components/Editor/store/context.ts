import { createContext, useContext } from 'solid-js'
import type { Store } from 'solid-js/store'
import type { XmlFragment } from 'yjs'
import type { WebrtcProvider } from 'y-webrtc'
import type { ProseMirrorExtension, ProseMirrorState } from '../prosemirror/helpers'
import type { Command, EditorState } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import type { Schema } from 'prosemirror-model'

export interface ExtensionsProps {
  data?: unknown
  keymap?: { [key: string]: Command }
  config: Config
  markdown: boolean
  path?: string
  y?: YOptions
  schema?: Schema
  collab?: Collab
  typewriterMode?: boolean
}
export interface Args {
  cwd?: string
  draft?: string
  room?: string
  text?: any
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
  typewriterMode: boolean
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
  loading?: LoadingType
  fullscreen?: boolean
  collab?: Collab
  path?: string
  args?: Args
  keymap?: { [key: string]: Command }
}

export interface Draft {
  body?: string
  lastModified?: Date
  text?: { doc: EditorState['doc']; selection: { type: string; anchor: number; head: number } }
  path?: string
  markdown?: boolean
  extensions?: ProseMirrorExtension[]
}

export interface EditorActions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export class ServiceError extends Error {
  public errorObject: ErrorObject
  constructor(id: string, props: unknown) {
    super(id)
    this.errorObject = { id, props }
  }
}

export const StateContext = createContext<[Store<State>, EditorActions]>([undefined, undefined])

export const useState = () => useContext(StateContext)

export const newState = (props: Partial<State> = {}): State => ({
  extensions: [],
  drafts: [],
  loading: 'loading',
  fullscreen: false,
  markdown: false,
  config: {
    theme: undefined,
    // codeTheme: 'material-light',
    font: 'muller',
    fontSize: 24,
    contentWidth: 800,
    typewriterMode: true,
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
