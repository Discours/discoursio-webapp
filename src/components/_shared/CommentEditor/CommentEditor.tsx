import styles from './styles/CommentEditor.module.scss'
import './styles/ProseMirrorOverrides.scss'
import { clsx } from 'clsx'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import Button from '../Button'
import { schema } from './schema'
import { customKeymap } from '../../EditorNew/prosemirror/plugins/customKeymap'
import { createEffect, onMount } from 'solid-js'
import { DOMSerializer } from 'prosemirror-model'
import { renderGrouped } from 'prosemirror-menu'
import { buildMenuItems } from './menu'
import { placeholder } from '../../EditorNew/prosemirror/plugins/placeholder'
import { t } from '../../../utils/intl'

type Props = {
  initialValue: string
  onSubmit: (value: string) => void
  clear?: boolean
}

const htmlContainer = typeof document === 'undefined' ? null : document.createElement('div')
const getHtml = (state: EditorState) => {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(state.doc.content)
  htmlContainer.replaceChildren(fragment)
  return htmlContainer.innerHTML
}

const CommentEditor = (props: Props) => {
  const editorElRef: { current: HTMLDivElement } = { current: null }
  const menuElRef: { current: HTMLDivElement } = { current: null }
  const editorViewRef: { current: EditorView } = { current: null }

  const initEditor = () => {
    editorViewRef.current = new EditorView(editorElRef.current, {
      state: EditorState.create({
        schema,
        plugins: [placeholder(props.initialValue), customKeymap()]
      })
    })
  }

  onMount(() => {
    initEditor()
    const { dom } = renderGrouped(editorViewRef.current, buildMenuItems(schema))
    menuElRef.current.appendChild(dom)
  })

  const handleSubmitButtonClick = () => {
    props.onSubmit(getHtml(editorViewRef.current.state))
  }

  const clearEditor = () => {
    editorViewRef.current.destroy()
    initEditor()
  }

  createEffect(() => {
    if (props.clear) clearEditor()
  })

  return (
    <div class={styles.commentEditor}>
      <div class={clsx('ProseMirrorOverrides', styles.textarea)} ref={(el) => (editorElRef.current = el)} />
      <div class={styles.actions}>
        <div class={styles.menu} ref={(el) => (menuElRef.current = el)} />
        <div class={styles.buttons}>
          <Button value={t('Send')} variant="primary" onClick={handleSubmitButtonClick} />
          <Button value="Cancel" variant="secondary" onClick={clearEditor} />
        </div>
      </div>
    </div>
  )
}

export default CommentEditor
