import './styles/Editor.scss'
import type { EditorView } from 'prosemirror-view'
import type { EditorState } from 'prosemirror-state'
import { useState } from './store'
import { ProseMirror } from './components/ProseMirror'

export const Editor = () => {
  const [store, ctrl] = useState()
  const onInit = (text: EditorState, editorView: EditorView) => ctrl.setState({ editorView, text })
  const onReconfigure = (text: EditorState) => ctrl.setState({ text })
  const onChange = (text: EditorState) => ctrl.setState({ text, lastModified: new Date() })
  return (
    <ProseMirror
      class="editor"
      style={store.markdown && `white-space: pre-wrap;`}
      editorView={store.editorView}
      text={store.text}
      extensions={store.extensions}
      onInit={onInit}
      onReconfigure={onReconfigure}
      onChange={onChange}
    />
  )
}
