import type { EditorView } from 'prosemirror-view'
import type { EditorState } from 'prosemirror-state'
import { useState } from '../store/context'
import { ProseMirror } from './ProseMirror'
import styles from './Editor.module.scss'
import { clsx } from 'clsx'

export const Editor = () => {
  const [store, ctrl] = useState()
  const onInit = (text: EditorState, editorView: EditorView) => ctrl.setState({ editorView, text })
  const onReconfigure = (text: EditorState) => ctrl.setState({ text })
  const onChange = (text: EditorState) => ctrl.setState({ text, lastModified: new Date() })

  return (
    <ProseMirror
      cssClass={clsx(styles.editor, 'col-md-6', 'shift-content', {
        [styles.error]: store.error,
        [styles.markdown]: store.markdown
      })}
      editorView={store.editorView}
      text={store.text}
      extensions={store.extensions}
      onInit={onInit}
      onReconfigure={onReconfigure}
      onChange={onChange}
    />
  )
}
