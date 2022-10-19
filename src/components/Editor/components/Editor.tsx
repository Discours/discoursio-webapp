import type { EditorView } from 'prosemirror-view'
import type { EditorState } from 'prosemirror-state'
import { useState } from '../store/context'
import { ProseMirror } from './ProseMirror'
import '../styles/Editor.scss'

export const Editor = () => {
  const [store, ctrl] = useState()
  const onInit = (text: EditorState, editorView: EditorView) => ctrl.setState({ editorView, text })
  const onReconfigure = (text: EditorState) => ctrl.setState({ text })
  const onChange = (text: EditorState) => ctrl.setState({ text, lastModified: new Date() })
  const style = () => {
    if (store.error) {
      return `display: none;`
    } else {
      return store.markdown ? `white-space: pre-wrap;` : ''
    }
  }
  return (
    <ProseMirror
      // eslint-disable-next-line solid/no-react-specific-props
      className="editor"
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
