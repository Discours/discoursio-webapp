import './Editor.scss'
import type { EditorView } from 'prosemirror-view'
import type { EditorState } from 'prosemirror-state'
import { useState } from './prosemirror/context'
import { ProseMirror } from './prosemirror'

export default () => {
  const [store, ctrl] = useState()
  const onInit = (text: EditorState, editorView: EditorView) => ctrl.setState({ editorView, text })
  const onReconfigure = (text: EditorState) => ctrl.setState({ text })
  const onChange = (text: EditorState) => ctrl.setState({ text, lastModified: new Date() })
  // const editorCss = (config) => css``
  const style = () => {
    if (store.error) {
      return `display: none;`
    }

    if (store.markdown) {
      return `white-space: pre-wrap;`
    }

    return ''
  }

  return (
    <ProseMirror
      class="editor"
      style={style()}
      editorView={store.editorView}
      text={store.text}
      extensions={store.extensions}
      onInit={onInit}
      onReconfigure={onReconfigure}
      onChange={onChange}
    />
  )
}
