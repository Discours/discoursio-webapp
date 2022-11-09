import { createSignal, onMount } from 'solid-js'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView, MarkViewConstructor, NodeViewConstructor } from 'prosemirror-view'
import './prosemirror/styles/ProseMirror.scss'
import type { Nodes, Marks } from './prosemirror/schema'
import { createImageView } from './prosemirror/views/image'
import { MarkdownSerializer } from 'prosemirror-markdown'
import { schema } from './prosemirror/schema'
import { createPlugins } from './prosemirror/plugins'

import debounce from 'lodash/debounce'
import { DOMSerializer } from 'prosemirror-model'
import { clsx } from 'clsx'
import styles from '../Nav/AuthModal/AuthModal.module.scss'
import { t } from '../../utils/intl'
import { apiClient } from '../../utils/apiClient'
import { createArticle } from '../../stores/zine/articles'
import type { InputMaybe, Scalars, ShoutInput } from '../../graphql/types.gen'
import { Sidebar } from './Sidebar'

const htmlContainer = typeof document === 'undefined' ? null : document.createElement('div')

const getHtml = (state: EditorState) => {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(state.doc.content)
  htmlContainer.replaceChildren(fragment)
  return htmlContainer.innerHTML
}

export const Editor = () => {
  const [markdown, setMarkdown] = createSignal('')
  const [html, setHtml] = createSignal('')

  const editorElRef: {
    current: HTMLDivElement
  } = {
    current: null
  }

  const editorViewRef: { current: EditorView } = { current: null }

  const update = (state: EditorState) => {
    const newHtml = getHtml(state)
    setHtml(newHtml)
    // setMarkdown(state.toJSON())
    // const el = document.createElement('div')
  }

  const debouncedUpdate = debounce(update, 500)

  const dispatchTransaction = (tr: Transaction) => {
    const newState = editorViewRef.current.state.apply(tr)
    editorViewRef.current.updateState(newState)
    debouncedUpdate(newState)
  }

  onMount(async () => {
    const plugins = createPlugins({ schema })

    const nodeViews: Partial<Record<Nodes, NodeViewConstructor>> = {
      image: createImageView
    }

    const markViews: Partial<Record<Marks, MarkViewConstructor>> = {}

    editorViewRef.current = new EditorView(editorElRef.current, {
      state: EditorState.create({
        schema,
        plugins
      }),
      nodeViews,
      markViews,
      dispatchTransaction
    })

    editorViewRef.current.focus()
  })

  const handleSaveButtonClick = () => {
    const article: ShoutInput = {
      body: getHtml(editorViewRef.current.state),
      community: 'discours', // ?
      slug: 'new-' + Math.floor(Math.random() * 1000000)
    }
    createArticle({ article })
  }

  return (
    <div class="container" style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div ref={(el) => (editorElRef.current = el)} />
        <div>Markdown:</div>
        <div>{markdown()}</div>
        <div>HTML:</div>
        <div>{html()}</div>
        <button class={clsx('button')} onClick={handleSaveButtonClick}>
          Опубликовать
        </button>
      </div>
      <Sidebar editorViewRef={editorViewRef} />
    </div>
  )
}
