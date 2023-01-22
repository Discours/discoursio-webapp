import styles from './CommentEditor.module.scss'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView, MarkViewConstructor, NodeViewConstructor } from 'prosemirror-view'
import Button from '../_shared/Button'
import { schema } from './schema'
import { customKeymap } from '../EditorNew/prosemirror/plugins/customKeymap'
import { onMount } from 'solid-js'
import { DOMSerializer } from 'prosemirror-model'
import { renderGrouped } from 'prosemirror-menu'
import { buildMenuItems } from './menu'

type Props = {
  initialValue: string
  onSubmit: (value: string) => void
  onCancel: () => void
}

const htmlContainer = typeof document === 'undefined' ? null : document.createElement('div')
const getHtml = (state: EditorState) => {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(state.doc.content)
  htmlContainer.replaceChildren(fragment)
  return htmlContainer.innerHTML
}

const CommentEditor = (props: Props) => {
  const editorElRef: {
    current: HTMLDivElement
  } = {
    current: null
  }

  const menuElRef: {
    current: HTMLDivElement
  } = {
    current: null
  }

  const editorViewRef: { current: EditorView } = { current: null }
  onMount(() => {
    editorViewRef.current = new EditorView(editorElRef.current, {
      state: EditorState.create({
        schema,
        plugins: [customKeymap()]
      })
    })

    const { dom } = renderGrouped(editorViewRef.current, buildMenuItems(schema))
    menuElRef.current.appendChild(dom)
  })

  const handleSubmitButtonClick = () => {
    props.onSubmit(getHtml(editorViewRef.current.state))
  }

  return (
    <div class={styles.commentEditor}>
      <div class={styles.textarea} ref={(el) => (editorElRef.current = el)} />
      <div class={styles.actions}>
        <div class={styles.menu} ref={(el) => (menuElRef.current = el)} />
        <Button value="Send" variant="primary" onClick={handleSubmitButtonClick} />
        <Button value="Cancel" variant="secondary" />
      </div>
    </div>
  )
}

export default CommentEditor
