import { createContext, useContext } from 'solid-js'
import type { Store } from 'solid-js/store'
import type { XmlFragment } from 'yjs'
import type { WebrtcProvider } from 'y-webrtc'
import type { ProseMirrorExtension, ProseMirrorState } from '../prosemirror/helpers'
import type { EditorView } from 'prosemirror-view'

export interface Args {
  cwd?: string
  draft?: string
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
  // alwaysOnTop: boolean;
  font: string
  fontSize: number
  contentWidth: number
  typewriterMode?: boolean;
  prettier: PrettierConfig
}

export interface ErrorObject {
  id: string
  props?: any
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
  fullscreen?: boolean
  collab?: Collab
  path?: string
  args?: Args
  isMac?: boolean
}

export interface Draft {
  text?: { [key: string]: any }
  body?: string
  lastModified?: Date
  path?: string
  markdown?: boolean
  extensions?: ProseMirrorExtension[]
}

export class ServiceError extends Error {
  public errorObject: ErrorObject
  constructor(id: string, props: any) {
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
  fullscreen: false,
  markdown: false,
  config: {
    theme: undefined,
    // codeTheme: 'material-light',
    font: 'muller',
    fontSize: 24,
    contentWidth: 800,
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
