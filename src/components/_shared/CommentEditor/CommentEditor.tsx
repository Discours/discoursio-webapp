import styles from './styles/CommentEditor.module.scss'
import './styles/ProseMirrorOverrides.scss'
import { clsx } from 'clsx'
import Button from '../Button'
import { createEffect, createMemo, onMount } from 'solid-js'
import { t } from '../../../utils/intl'
//ProseMirror deps
import { schema } from './schema'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { DOMSerializer } from 'prosemirror-model'
import { renderGrouped } from 'prosemirror-menu'
import { buildMenuItems } from './menu'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { customKeymap } from '../../EditorNew/prosemirror/plugins/customKeymap'
import { placeholder } from '../../EditorNew/prosemirror/plugins/placeholder'
import { undo, redo, history } from 'prosemirror-history'

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
        plugins: [
          history(),
          customKeymap(),
          placeholder(props.initialValue),
          keymap({ 'Mod-z': undo, 'Mod-y': redo }),
          keymap(baseKeymap)
        ]
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
    <>
      <div class={styles.commentEditor}>
        <div
          class={clsx('ProseMirrorOverrides', styles.textarea)}
          ref={(el) => (editorElRef.current = el)}
        />
        <div class={styles.actions}>
          <div class={styles.menu} ref={(el) => (menuElRef.current = el)} />
          <div class={styles.buttons}>
            <Button value={t('Send')} variant="primary" onClick={handleSubmitButtonClick} />
            <Button value="Cancel" variant="secondary" onClick={clearEditor} />
          </div>
        </div>
      </div>
      <div class={styles.helpText}>{'"Cmd-Z": Undo, "Cmd-Y": Redo'}</div>
    </>
  )
}

export default CommentEditor
