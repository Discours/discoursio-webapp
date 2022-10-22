import { Store, createStore, unwrap } from 'solid-js/store'
import { v4 as uuidv4 } from 'uuid'
import type { EditorState } from 'prosemirror-state'
import { undo, redo } from 'prosemirror-history'
import { selectAll, deleteSelection } from 'prosemirror-commands'
import { undo as yUndo, redo as yRedo } from 'y-prosemirror'
import debounce from 'lodash/debounce'
import { createSchema, createExtensions, createEmptyText } from '../prosemirror/setup'
import { State, Draft, Config, ServiceError, newState, ExtensionsProps } from './context'
import { mod } from '../env'
import { serialize, createMarkdownParser } from '../markdown'
import db from '../db'
import { isEmpty, isInitialized } from '../prosemirror/helpers'

const isText = (x) => x && x.doc && x.selection
const isState = (x) => typeof x.lastModified !== 'string' && Array.isArray(x.drafts || [])
const isDraft = (x): boolean => x && (x.text || x.path)

export const createCtrl = (initial: State): [Store<State>, any] => {
  const [store, setState] = createStore(initial)

  const onUndo = () => {
    if (!isInitialized(store.text)) return
    const text = store.text as EditorState
    if (store.collab?.started) {
      yUndo(text)
    } else {
      undo(text, store.editorView.dispatch)
    }
    return true
  }

  const onRedo = () => {
    if (!isInitialized(store.text)) return false
    const text = store.text as EditorState
    if (store.collab?.started) {
      yRedo(text)
    } else {
      redo(text, store.editorView.dispatch)
    }
    return true
  }

  const discard = () => {
    if (store.path) {
      discardText()
    } else if (store.drafts.length > 0 && isEmpty(store.text)) {
      discardText()
    } else {
      selectAll(store.editorView.state, store.editorView.dispatch)
      deleteSelection(store.editorView.state, store.editorView.dispatch)
    }
    return true
  }

  const toggleMarkdown = () => {
    const state = unwrap(store)
    const editorState = store.text as EditorState
    const markdown = !state.markdown
    const selection = { type: 'text', anchor: 1, head: 1 }
    let doc: any

    if (markdown) {
      const lines = serialize(editorState).split('\n')
      const nodes = lines.map((text) => text ? { type: 'paragraph', content: [{ type: 'text', text }] } : { type: 'paragraph' })

      doc = { type: 'doc', content: nodes }
    } else {
      const schema = createSchema({
        config: state.config,
        path: state.path,
        y: state.collab?.y,
        markdown,
        keymap
      })

      const parser = createMarkdownParser(schema)
      let textContent = ''
      editorState.doc.forEach((node) => {
        textContent += `${node.textContent}\n`
      })
      const text = parser.parse(textContent)
      doc = text.toJSON()
    }

    const extensions = createExtensions({
      config: state.config,
      markdown,
      path: state.path,
      keymap,
      y: state.collab?.y
    })

    setState({
      text: { selection, doc },
      extensions,
      markdown
    })
    return true
  }

  const keymap = {
    [`${mod}-w`]: discard,
    [`${mod}-z`]: onUndo,
    [`Shift-${mod}-z`]: onRedo,
    [`${mod}-y`]: onRedo,
    [`${mod}-m`]: toggleMarkdown
  } as ExtensionsProps['keymap']

  const createTextFromDraft = async (draft: Draft) => {
    const state = unwrap(store)

    const extensions = createExtensions({
      config: state.config,
      markdown: draft.markdown,
      path: draft.path,
      keymap
    })

    return {
      text: draft.text,
      extensions,
      lastModified: draft.lastModified ? new Date(draft.lastModified) : undefined,
      path: draft.path,
      markdown: draft.markdown
    }
  }

  const addToDrafts = (drafts: Draft[], prev: State) => {
    const text = prev.path ? undefined : (prev.text as EditorState).toJSON()
    return [
      ...drafts,
      {
        text,
        lastModified: prev.lastModified,
        path: prev.path,
        markdown: prev.markdown
      }
    ]
  }

  const discardText = async () => {
    const state = unwrap(store)
    const index = state.drafts.length - 1
    const draft = index !== -1 ? state.drafts[index] : undefined

    let next: Partial<State>
    if (draft) {
      next = await createTextFromDraft(draft)
    } else {
      const extensions = createExtensions({
        config: state.config ?? store.config,
        markdown: state.markdown ?? store.markdown,
        keymap
      })

      next = {
        text: createEmptyText(),
        extensions,
        lastModified: undefined,
        path: undefined,
        markdown: state.markdown
      }
    }

    const drafts = state.drafts.filter((f: Draft) => f !== draft)

    setState({
      drafts,
      ...next,
      collab: draft ? undefined : state.collab,
      error: undefined
    })
  }

  const fetchData = async (): Promise<State> => {
    const state: State = unwrap(store)
    const room = window.location.pathname?.slice(1).trim()
    const args = { room: room ?? undefined }
    const data = await db.get('state')
    let parsed: any
    if (data !== undefined) {
      try {
        parsed = JSON.parse(data)
      } catch (error) {
        console.error(error)
        throw new ServiceError('invalid_state', data)
      }
    }

    if (!parsed) {
      return { ...state, args }
    }

    let text = state.text
    if (parsed.text) {
      if (!isText(parsed.text)) {
        throw new ServiceError('invalid_state', parsed.text)
      }

      text = parsed.text
    }

    const extensions = createExtensions({
      path: parsed.path,
      markdown: parsed.markdown,
      keymap,
      config: undefined
    })

    const newst = {
      ...parsed,
      text,
      extensions,
      // config,
      args
    }

    if (newst.lastModified) {
      newst.lastModified = new Date(newst.lastModified)
    }

    for (const draft of parsed.drafts || []) {
      if (!isDraft(draft)) {
        throw new ServiceError('invalid_draft', draft)
      }
    }

    if (!isState(newst)) {
      throw new ServiceError('invalid_state', newst)
    }

    return newst
  }

  const getTheme = (state: State) => ({ theme: state.config.theme })

  const clean = () => {
    setState({
      ...newState(),
      loading: 'initialized',
      drafts: [],
      fullscreen: store.fullscreen,
      lastModified: new Date(),
      error: undefined,
      text: undefined
    })
  }

  const init = async () => {
    let data = await fetchData()
    try {
      if (data.args.room) {
        data = await doStartCollab(data)
      } else if (!data.text) {
        const text = createEmptyText()
        const extensions = createExtensions({
          config: data.config ?? store.config,
          markdown: data.markdown ?? store.markdown,
          keymap
        })
        data = { ...data, text, extensions }
      }
    } catch (error) {
      data = { ...data, error: error.errorObject }
    }

    setState({
      ...data,
      config: { ...data.config, ...getTheme(data) },
      loading: 'initialized'
    })
  }

  const saveState = () => debounce(async (state: State) => {
    const data: State = {
      lastModified: state.lastModified,
      drafts: state.drafts,
      config: state.config,
      path: state.path,
      markdown: state.markdown,
      collab: {
        room: state.collab?.room
      }
    }

    if (isInitialized(state.text)) {
      data.text = store.editorView.state.toJSON()
    } else if (state.text) {
      data.text = state.text
    }

    db.set('state', JSON.stringify(data))
  }, 200)

  const setFullscreen = (fullscreen: boolean) => {
    setState({ fullscreen })
  }

  const startCollab = async () => {
    const state: State = unwrap(store)
    const update = await doStartCollab(state)
    setState(update)
  }

  const doStartCollab = async (state: State): Promise<State> => {
    const backup = state.args?.room && state.collab?.room !== state.args.room
    const room = state.args?.room ?? uuidv4()
    window.history.replaceState(null, '', `/${room}`)

    const { roomConnect } = await import('../prosemirror/p2p')
    const [type, provider] = roomConnect(room)

    const extensions = createExtensions({
      config: state.config,
      markdown: state.markdown,
      path: state.path,
      keymap,
      y: { type, provider }
    })

    let newst = state
    if ((backup && !isEmpty(state.text)) || state.path) {
      let drafts = state.drafts
      if (!state.error) {
        drafts = addToDrafts(drafts, state)
      }

      newst = {
        ...state,
        drafts,
        lastModified: undefined,
        path: undefined,
        error: undefined
      }
    }

    return {
      ...newst,
      extensions,
      collab: { started: true, room, y: { type, provider } }
    }
  }

  const stopCollab = (state: State) => {
    state.collab.y?.provider.destroy()
    const extensions = createExtensions({
      config: state.config,
      markdown: state.markdown,
      path: state.path,
      keymap
    })

    setState({ collab: undefined, extensions })
    window.history.replaceState(null, '', '/')
  }

  const updateConfig = (config: Partial<Config>) => {
    const state = unwrap(store)
    const extensions = createExtensions({
      config: { ...state.config, ...config },
      markdown: state.markdown,
      path: state.path,
      keymap,
      y: state.collab?.y
    })

    setState({
      config: { ...state.config, ...config },
      extensions,
      lastModified: new Date()
    })
  }

  const updatePath = (path: string) => {
    setState({ path, lastModified: new Date() })
  }

  const updateTheme = () => {
    const { theme }  = getTheme(unwrap(store))
    setState('config', { theme })
  }

  const ctrl = {
    clean,
    discard,
    getTheme,
    init,
    saveState,
    setFullscreen,
    setState,
    startCollab,
    stopCollab,
    toggleMarkdown,
    updateConfig,
    updatePath,
    updateTheme
  }

  return [store, ctrl]
}
