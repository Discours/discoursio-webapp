import { createContext, useContext } from 'solid-js'
import type { Store } from 'solid-js/store'
import type { XmlFragment } from 'yjs'
import type { WebrtcProvider } from 'y-webrtc'
import type { ProseMirrorExtension, ProseMirrorState } from '../prosemirror/state'
import type { Reaction } from '../../../graphql/types.gen'
import type { EditorView } from 'prosemirror-view'

export const isMac = true

export const mod = isMac ? 'Cmd' : 'Ctrl'
export const alt = isMac ? 'Cmd' : 'Alt'

export interface Args {
  cwd?: string
  file?: string
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
  alwaysOnTop: boolean
  // typewriterMode: boolean;
  prettier: PrettierConfig
}

export interface ErrorObject {
  message: string
  id: string
  props: unknown
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

export interface File {
  text?: { [key: string]: any }
  lastModified?: string
  path?: string
  markdown?: boolean
}

export interface State {
  text?: ProseMirrorState
  editorView?: EditorView
  extensions?: ProseMirrorExtension[]
  markdown?: boolean
  lastModified?: Date
  files: File[]
  config: Config
  error?: ErrorObject
  loading: LoadingType
  fullscreen: boolean
  collab?: Collab
  path?: string
  args?: Args
}

export class ServiceError extends Error {
  public errorObject: ErrorObject
  constructor(id: string, props: unknown) {
    super(id)
    this.errorObject = { id, props, message: '' }
  }
}

const DEFAULT_CONFIG = {
  theme: '',
  // codeTheme: 'material-light',
  font: 'muller',
  fontSize: 24,
  contentWidth: 800,
  alwaysOnTop: isMac,
  // typewriterMode: true,
  prettier: {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true
  }
}

export const StateContext = createContext<[Store<State>, any]>([{} as Store<State>, undefined])

export const useState = () => useContext(StateContext)

export const newState = (props: Partial<State> = {}): State => ({
  extensions: [],
  files: [],
  loading: 'loading',
  fullscreen: false,
  markdown: false,
  config: DEFAULT_CONFIG,
  ...props
})
