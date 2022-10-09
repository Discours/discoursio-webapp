import { Store, createStore, unwrap } from 'solid-js/store'
import { v4 as uuidv4 } from 'uuid'
import type { EditorState } from 'prosemirror-state'
import { undo, redo } from 'prosemirror-history'
import { selectAll, deleteSelection } from 'prosemirror-commands'
import * as Y from 'yjs'
import { undo as yUndo, redo as yRedo } from 'y-prosemirror'
import { WebrtcProvider } from 'y-webrtc'
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import debounce from 'lodash/debounce'
import { createSchema, createExtensions, createEmptyText } from '../prosemirror/setup'
import { State, Draft, Config, ServiceError, newState } from '.'
import { serialize, createMarkdownParser } from '../prosemirror/markdown'
import db from '../db'
import { isEmpty, isInitialized } from '../prosemirror/helpers'
import { Awareness } from 'y-protocols/awareness'
import { drafts as draftsatom } from '../../../stores/editor'
import { useStore } from '@nanostores/solid'
import { createMemo } from 'solid-js'

const isText = (x) => x && x.doc && x.selection
const isState = (x) => typeof x.lastModified !== 'string' && Array.isArray(x.drafts)
const isDraft = (x): boolean => x && (x.text || x.path)
const mod = 'Ctrl'

export const createCtrl = (initial): [Store<State>, any] => {
  const [store, setState] = createStore(initial)

  const onNew = () => {
    newDraft()
    return true
  }

  const onDiscard = () => {
    discard()
    return true
  }

  const onToggleMarkdown = () => toggleMarkdown()

  const onUndo = () => {
    if (!isInitialized(store.text as EditorState)) return
    const text = store.text as EditorState
    store.collab?.started ? yUndo(text) : undo(text, store.editorView.dispatch)
    return true
  }

  const onRedo = () => {
    if (!isInitialized(store.text as EditorState)) return
    const text = store.text as EditorState
    if (store.collab?.started) {
      yRedo(text)
    } else {
      redo(text, store.editorView.dispatch)
    }

    return true
  }

  const keymap = {
    [`${mod}-n`]: onNew,
    [`${mod}-w`]: onDiscard,
    [`${mod}-z`]: onUndo,
    [`Shift-${mod}-z`]: onRedo,
    [`${mod}-y`]: onRedo,
    [`${mod}-m`]: onToggleMarkdown
  }

  const createTextFromDraft = async (d: Draft): Promise<Draft> => {
    let draft = d
    const state = unwrap(store)
    if (draft.path) {
      draft = await loadDraft(state.config, draft.path)
    }

    const extensions = createExtensions({
      config: state.config,
      markdown: draft.markdown,
      path: draft.path,
      keymap
    })

    return {
      text: draft.text,
      extensions,
      updatedAt: draft.updatedAt ? new Date(draft.updatedAt) : undefined,
      path: draft.path,
      markdown: draft.markdown
    }
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const addToDrafts = (drafts: Draft[], prev: Draft) => {
    const text = prev.path ? undefined : JSON.stringify(prev.text)
    return [
      ...drafts,
      {
        body: text,
        updatedAt: prev.updatedAt as Date,
        path: prev.path,
        markdown: prev.markdown
      } as Draft
    ]
  }

  const discardText = async () => {
    const state = unwrap(store)
    const index = state.drafts.length - 1
    const draft = index !== -1 ? state.drafts[index] : undefined

    let next
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
        updatedAt: new Date(),
        path: undefined,
        markdown: state.markdown
      }
    }

    const drafts = state.drafts.filter((f: Draft) => f !== draft)

    setState({
      drafts,
      ...next,
      collab: state.collab,
      error: undefined
    })
  }

  const fetchData = async (): Promise<State> => {
    const state: State = unwrap(store)
    const room = window.location.pathname?.slice(1).trim()
    const args = { room, draft: room }
    const data = await db.get('state')
    let parsed
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
      args,
      lastModified: new Date(parsed.lastModified)
    }

    for (const draft of parsed.drafts) {
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

  const discard = async () => {
    if (store.path) {
      await discardText()
    } else if (store.drafts.length > 0 && isEmpty(store.text as EditorState)) {
      await discardText()
    } else {
      selectAll(store.editorView.state, store.editorView.dispatch)
      deleteSelection(store.editorView.state, store.editorView.dispatch)
    }
  }

  const init = async () => {
    let data = await fetchData()
    try {
      if (data.args.room) {
        data = doStartCollab(data)
      } else if (data.args.text) {
        data = await doOpenDraft(data, {
          text: { ...JSON.parse(data.args.text) },
          updatedAt: new Date()
        })
      } else if (data.args.draft) {
        const draft = await loadDraft(data.config, data.args.draft)
        data = await doOpenDraft(data, draft)
      } else if (data.path) {
        const draft = await loadDraft(data.config, data.path)
        data = await doOpenDraft(data, draft)
      } else if (!data.text) {
        const text = createEmptyText()
        const extensions = createExtensions({
          config: data.config ?? store.config,
          markdown: data.markdown ?? store.markdown,
          keymap: keymap
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

  const loadDraft = async (config: Config, path: string): Promise<Draft> => {
    const draftstore = useStore(draftsatom)
    const draft = createMemo(() => draftstore()[path])
    const lastModified = draft().updatedAt
    const draftContent = draft().body
    const schema = createSchema({
      config,
      markdown: false,
      path,
      keymap
    })
    const parser = createMarkdownParser(schema)
    const doc = parser.parse(draftContent).toJSON()
    const text = {
      doc,
      selection: {
        type: 'text',
        anchor: 1,
        head: 1
      }
    }
    return {
      ...draft(),
      body: doc,
      text,
      updatedAt: lastModified.toISOString(),
      path
    }
  }

  const newDraft = () => {
    if (isEmpty(store.text as EditorState) && !store.path) return
    const state = unwrap(store)
    let drafts = state.drafts
    if (!state.error) {
      drafts = addToDrafts(drafts, state)
    }

    const extensions = createExtensions({
      config: state.config ?? store.config,
      markdown: state.markdown ?? store.markdown,
      keymap
    })

    setState({
      text: createEmptyText(),
      extensions,
      drafts,
      lastModified: undefined,
      path: undefined,
      error: undefined,
      collab: undefined
    })
  }

  const openDraft = async (draft: Draft) => {
    const state: State = unwrap(store)
    const update = await doOpenDraft(state, draft)
    setState(update)
  }

  const doOpenDraft = async (state: State, draft: Draft): Promise<State> => {
    const findIndexOfDraft = (f: Draft) => {
      for (let i = 0; i < state.drafts.length; i++) {
        if (state.drafts[i] === f || (f.path && state.drafts[i].path === f.path)) return i
      }
      return -1
    }
    const index = findIndexOfDraft(draft)
    const item = index === -1 ? draft : state.drafts[index]
    let drafts = state.drafts.filter((f) => f !== item)
    if (!isEmpty(state.text as EditorState) && state.lastModified) {
      drafts = addToDrafts(drafts, { updatedAt: new Date(), text: state.text } as Draft)
    }
    draft.updatedAt = item.updatedAt
    const next = await createTextFromDraft(draft)

    return {
      ...state,
      ...next,
      drafts,
      collab: undefined,
      error: undefined
    }
  }

  const saveState = () =>
    debounce(async (state: State) => {
      const data: any = {
        lastModified: state.lastModified,
        drafts: state.drafts,
        config: state.config,
        path: state.path,
        markdown: state.markdown,
        collab: {
          room: state.collab?.room
        }
      }

      if (isInitialized(state.text as EditorState)) {
        if (state.path) {
          const text = serialize(store.editorView.state)
          // TODO: await remote.writeDraft(state.path, text)
        } else {
          data.text = store.editorView.state.toJSON()
        }
      } else if (state.text) {
        data.text = state.text
      }

      db.set('state', JSON.stringify(data))
    }, 200)

  const startCollab = () => {
    const state: State = unwrap(store)
    const update = doStartCollab(state)
    setState(update)
  }

  const doStartCollab = (state: State): State => {
    const backup = state.args?.room && state.collab?.room !== state.args.room
    const room = state.args?.room ?? uuidv4()
    window.history.replaceState(null, '', `/${room}`)

    const ydoc = new Y.Doc()
    const type = ydoc.getXmlFragment('prosemirror')
    const webrtcOptions = {
      awareness: new Awareness(ydoc),
      filterBcConns: true,
      maxConns: 33,
      signaling: [
        // 'wss://signaling.discours.io',
        // 'wss://stun.l.google.com:19302',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://signaling.yjs.dev'
      ],
      peerOpts: {},
      password: ''
    }
    const provider = new WebrtcProvider(room, ydoc, webrtcOptions)
    const username = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      style: 'capital',
      separator: ' ',
      length: 2
    })

    provider.awareness.setLocalStateField('user', {
      name: username
    })

    const extensions = createExtensions({
      config: state.config,
      markdown: state.markdown,
      path: state.path,
      keymap,
      y: { type, provider }
    })

    let newst = state
    if ((backup && !isEmpty(state.text as EditorState)) || state.path) {
      let drafts = state.drafts
      if (!state.error) {
        drafts = addToDrafts(drafts, { updatedAt: new Date(), text: state.text } as Draft)
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

  const toggleMarkdown = () => {
    const state = unwrap(store)
    const editorState = store.text as EditorState
    const markdown = !state.markdown
    const selection = { type: 'text', anchor: 1, head: 1 }
    let doc: any

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
      doc = text.toJSON()
    }

    const extensions = createExtensions({
      config: state.config,
      markdown,
      path: state.path,
      keymap: keymap,
      y: state.collab?.y
    })

    setState({
      text: { selection, doc },
      extensions,
      markdown
    })
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
    loadDraft,
    newDraft,
    openDraft,
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
