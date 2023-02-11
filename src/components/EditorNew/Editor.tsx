import { onMount } from 'solid-js'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView, MarkViewConstructor, NodeViewConstructor } from 'prosemirror-view'
import './prosemirror/styles/ProseMirror.scss'
import type { Nodes, Marks } from './prosemirror/schema'
import { createImageView } from './prosemirror/views/image'
import { schema } from './prosemirror/schema'
import { createPlugins } from './prosemirror/plugins'
import { DOMParser as ProseDOMParser, DOMSerializer } from 'prosemirror-model'
import { clsx } from 'clsx'
import { createArticle } from '../../stores/zine/articles'
import type { ShoutInput } from '../../graphql/types.gen'
import { Sidebar } from './Sidebar'
import styles from './Sidebar.module.scss'

type Props = {
  initialContent?: string
}

const htmlContainer = typeof document === 'undefined' ? null : document.createElement('div')

const getHtml = (state: EditorState) => {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(state.doc.content)
  htmlContainer.replaceChildren(fragment)
  return htmlContainer.innerHTML
}

export const Editor = (props: Props) => {
  const editorElRef: {
    current: HTMLDivElement
  } = {
    current: null
  }

  const editorViewRef: { current: EditorView } = { current: null }

  const dispatchTransaction = (tr: Transaction) => {
    const newState = editorViewRef.current.state.apply(tr)
    editorViewRef.current.updateState(newState)
  }

  onMount(async () => {
    const plugins = createPlugins({ schema })

    const nodeViews: Partial<Record<Nodes, NodeViewConstructor>> = {
      image: createImageView
    }

    const markViews: Partial<Record<Marks, MarkViewConstructor>> = {}

    const domNew = new DOMParser().parseFromString(`<div>${props.initialContent}</div>`, 'text/xml')
    const doc = ProseDOMParser.fromSchema(schema).parse(domNew)

    editorViewRef.current = new EditorView(editorElRef.current, {
      state: EditorState.create({
        doc,
        schema,
        plugins
      }),
      nodeViews,
      markViews,
      dispatchTransaction
    })

    editorViewRef.current.dom.classList.add('createArticle')
    editorViewRef.current.focus()
  })

  const handleSaveButtonClick = () => {
    const article: ShoutInput = {
      body: getHtml(editorViewRef.current.state),
      community: 1, // 'discours' ?
      slug: 'new-' + Math.floor(Math.random() * 1000000)
    }
    createArticle({ article })
  }

  return (
    <div class={clsx('container')} style={{ width: '100%', 'max-width': '670px' }}>
      <div class={styles.editor} ref={(el) => (editorElRef.current = el)} />
      <button class={clsx('button')} onClick={handleSaveButtonClick}>
        Опубликовать WIP
      </button>
      <Sidebar editorViewRef={editorViewRef} />
    </div>
  )
}

export default Editor
