import { Store, createStore, unwrap } from 'solid-js/store'
import { v4 as uuidv4 } from 'uuid'
import type { Command, EditorState } from 'prosemirror-state'
import { undo, redo } from 'prosemirror-history'
import { selectAll, deleteSelection } from 'prosemirror-commands'
import { undo as yUndo, redo as yRedo } from 'y-prosemirror'
import debounce from 'lodash/debounce'
import { createSchema, createExtensions, createEmptyText, InitOpts } from '../prosemirror/setup'
import { State, Config, ServiceError, newState, PeerData } from './context'
import { serialize, createMarkdownParser } from '../prosemirror/markdown'
import { isEmpty, isInitialized, ProseMirrorExtension } from './state'
import { isServer } from 'solid-js/web'
import { roomConnect } from '../prosemirror/p2p'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createCtrl = (initial: State): [Store<State>, { [key: string]: any }] => {
  const [store, setState] = createStore(initial)

  const discardText = async () => {
    const state = unwrap(store)

    const extensions = createExtensions({
      config: state.config ?? store.config,
      markdown: state.markdown && store.markdown,
      keymap
    })

    setState({
      text: createEmptyText(),
      extensions,
      lastModified: undefined,
      path: undefined,
      markdown: state.markdown,
      collab: state.collab,
      error: undefined
    })
  }

  const discard = async () => {
    if (store.path) {
      await discardText()
    } else {
      selectAll(store.editorView.state, store.editorView.dispatch)
      deleteSelection(store.editorView.state, store.editorView.dispatch)
    }
    return true
  }

  const onDiscard = () => {
    discard()
    return true
  }

  const onUndo = () => {
    if (!isInitialized(store.text as EditorState)) return false
    const text = store.text as EditorState
    if (store.collab?.started) yUndo(text)
    else undo(text, store.editorView.dispatch)
    return true
  }

  const onRedo = () => {
    if (!isInitialized(store.text as EditorState)) return false
    const text = store.text as EditorState
    if (store.collab?.started) yRedo(text)
    else redo(text, store.editorView.dispatch)
    return true
  }

  const toggleMarkdown = () => {
    const state = unwrap(store)
    const editorState = store.text as EditorState
    const markdown = !state.markdown
    const selection = { type: 'text', anchor: 1, head: 1 }
    let doc
    if (markdown) {
      const lines = serialize(editorState).split('\n')
      const nodes = lines.map((text) => {
        return text ? { type: 'paragraph', content: [{ type: 'text', text }] } : { type: 'paragraph' }
      })
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
      doc = text?.toJSON()
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
  }

  const mod = 'Ctrl'
  const keymap = {
    [`${mod}-w`]: onDiscard,
    [`${mod}-z`]: onUndo,
    [`Shift-${mod}-z`]: onRedo,
    [`${mod}-y`]: onRedo,
    [`${mod}-m`]: toggleMarkdown
  } as unknown as { [key: string]: Command }

  const fetchData = async (): Promise<State> => {
    if (isServer) return
    const state: State = unwrap(store)
    console.debug('[editor] init state', state)
    const { default: db } = await import('../db')
    const data: string = await db.get('state')
    if (data !== undefined) {
      console.debug('[editor] state stored before', data)
      try {
        const parsed = JSON.parse(data)
        let text = state.text
        const room = undefined // window.location.pathname?.slice(1) + uuidv4()
        const args = { room }
        if (!parsed) return { ...state, args }
        if (parsed?.text) {
          if (!parsed.text || !parsed.text.doc || !parsed.text.selection) {
            throw new ServiceError('invalid_state', parsed.text)
          } else {
            text = parsed.text
            console.debug('[editor] got text parsed')
          }
        }
        console.debug('[editor] json state parsed successfully', parsed)
        return {
          ...parsed,
          text,
          extensions: createExtensions({
            path: parsed.path,
            markdown: parsed.markdown,
            keymap,
            config: {} as Config
          }),
          args,
          lastModified: parsed.lastModified ? new Date(parsed.lastModified) : new Date()
        }
      } catch {
        throw new ServiceError('invalid_state', data)
      }
    }
  }

  const getTheme = (state: State) => ({ theme: state.config?.theme || '' })

  const clean = () => {
    const s: State = {
      ...newState(),
      loading: 'initialized',
      lastModified: new Date(),
      error: undefined,
      text: undefined,
      args: {}
    }
    setState(s)
    console.debug('[editor] clean state', s)
  }

  const init = async () => {
    let state = await fetchData()
    if (state) {
      console.debug('[editor] state initiated', state)
      try {
        if (state.args?.room) {
          state = { ...doStartCollab(state) }
        } else if (!state.text) {
          const text = createEmptyText()
          const extensions = createExtensions({
            config: state?.config || ({} as Config),
            markdown: state.markdown,
            keymap
          })
          state = { ...state, text, extensions }
        }
      } catch (error) {
        state = { ...state, error }
      }
      setState({
        ...state,
        config: {
          ...state.config,
          ...getTheme(state)
        },
        loading: 'initialized'
      })
    }
  }

  const saveState = () =>
    debounce(async (state: State) => {
      const data = {
        lastModified: state.lastModified,
        config: state.config,
        path: state.path,
        markdown: state.markdown,
        collab: {
          room: state.collab?.room
        },
        text: ''
      }
      if (isInitialized(state.text as EditorState)) {
        data.text = store.editorView.state.toJSON()
      } else if (state.text) {
        data.text = state.text as string
      }
      if (!isServer) {
        const { default: db } = await import('../db')
        db.set('state', JSON.stringify(data))
      }
    }, 200)

  const startCollab = () => {
    const state: State = unwrap(store)
    const update = doStartCollab(state)
    setState(update)
  }

  const doStartCollab = (state: State): State => {
    const backup = state.args?.room && state.collab?.room !== state.args.room
    const room = state.args?.room ?? uuidv4()
    const username = '' // FIXME: use authenticated user name
    const [payload, provider] = roomConnect(room, username)
    const extensions: ProseMirrorExtension[] = createExtensions({
      config: state.config,
      markdown: state.markdown,
      path: state.path,
      keymap,
      y: { payload, provider } as PeerData
    } as InitOpts)
    let nState = state
    if ((backup && !isEmpty(state.text as EditorState)) || state.path) {
      nState = {
        ...state,
        lastModified: undefined,
        path: undefined,
        error: undefined
      }
    }
    return {
      ...nState,
      extensions,
      collab: { started: true, room, y: { payload, provider } }
    }
  }

  const stopCollab = (state: State) => {
    state.collab?.y?.provider.destroy()
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
    const { theme } = getTheme(unwrap(store))
    setState('config', { theme })
  }

  const ctrl = {
    clean,
    discard,
    getTheme,
    init,
    saveState,
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
