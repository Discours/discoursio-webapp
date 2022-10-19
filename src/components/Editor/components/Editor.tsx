import type { EditorView } from 'prosemirror-view'
import type { EditorState } from 'prosemirror-state'
import { useState } from '../store'
import { ProseMirror } from '../components/ProseMirror'
import '../styles/Editor.scss'
import type { ProseMirrorExtension, ProseMirrorState } from '../prosemirror/helpers'

export default () => {
  const [store, ctrl] = useState()
  const onInit = (text: EditorState, editorView: EditorView) => ctrl.setState({ editorView, text })
  const onReconfigure = (text: EditorState) => ctrl.setState({ text })
  const onChange = (text: EditorState) => ctrl.setState({ text, lastModified: new Date() })
  // const editorCss = (config) => css``
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
      className={'editor'}
      style={style()}
      editorView={store.editorView as EditorView}
      text={store.text as ProseMirrorState}
      extensions={store.extensions as ProseMirrorExtension[]}
      onInit={onInit}
      onReconfigure={onReconfigure}
      onChange={onChange}
    />
  )
}
