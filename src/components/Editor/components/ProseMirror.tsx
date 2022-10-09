import { EditorState, type Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { unwrap } from 'solid-js/store'
import { createEffect, untrack } from 'solid-js'
import { createEditorState } from '../prosemirror'
import type { ProseMirrorState, ProseMirrorExtension } from '../prosemirror/helpers'

interface Props {
  style?: string
  className?: string
  text?: ProseMirrorState
  editorView?: EditorView
  extensions?: ProseMirrorExtension[]
  onInit: (s: EditorState, v: EditorView) => void
  onReconfigure: (s: EditorState) => void
  onChange: (s: EditorState) => void
}

export const ProseMirror = (props: Props) => {
  let editorRef: HTMLDivElement
  const editorView = () => untrack(() => unwrap(props.editorView))
  const dispatchTransaction = (tr: Transaction) => {
    if (!editorView()) return
    const newState = editorView().state.apply(tr)
    editorView().updateState(newState)
    if (!tr.docChanged) return
    props.onChange(newState)
  }

  createEffect(
    (state: [EditorState, ProseMirrorExtension[]]) => {
      const [prevText, prevExtensions] = state
      const text = unwrap(props.text)
      const extensions = unwrap(props.extensions)
      if (!text || !extensions?.length) {
        return [text, extensions]
      }

      if (!props.editorView) {
        const { editorState, nodeViews } = createEditorState(text, extensions)
        const view = new EditorView(editorRef, { state: editorState, nodeViews, dispatchTransaction })
        view.focus()
        props.onInit(editorState, view)
        return [editorState, extensions]
      }

      if (extensions !== prevExtensions || (!(text instanceof EditorState) && text !== prevText)) {
        const { editorState, nodeViews } = createEditorState(text, extensions, prevText)
        if (!editorState) return
        editorView().updateState(editorState)
        editorView().setProps({ nodeViews, dispatchTransaction })
        props.onReconfigure(editorState)
        editorView().focus()
        return [editorState, extensions]
      }

      return [text, extensions]
    },
    [props.text, props.extensions]
  )

  return <div style={props.style} ref={editorRef} class={props.className} spell-check={false} />
}
