import styles from './styles/CommentEditor.module.scss'
import './styles/ProseMirrorOverrides.scss'
import { clsx } from 'clsx'
import Button from '../Button'
import { createEffect, onMount, Show } from 'solid-js'
import { t } from '../../../utils/intl'
//ProseMirror deps
import { schema } from './schema'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { DOMParser as ProseDOMParser, DOMSerializer } from 'prosemirror-model'
import { renderGrouped } from 'prosemirror-menu'
import { buildMenuItems } from './menu'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { customKeymap } from '../../EditorNew/prosemirror/plugins/customKeymap'
import { placeholder } from '../../EditorNew/prosemirror/plugins/placeholder'
import { undo, redo, history } from 'prosemirror-history'
import { useSession } from '../../../context/session'

type Props = {
  placeholder?: string
  onSubmit: (value: string) => void
  clear?: boolean
  initialContent?: string
}

const htmlContainer = typeof document === 'undefined' ? null : document.createElement('div')
const getHtml = (state: EditorState) => {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(state.doc.content)
  htmlContainer.replaceChildren(fragment)
  return htmlContainer.innerHTML
}

const CommentEditor = (props: Props) => {
  const { session } = useSession()
  const editorElRef: { current: HTMLDivElement } = { current: null }
  const menuElRef: { current: HTMLDivElement } = { current: null }
  const editorViewRef: { current: EditorView } = { current: null }

  const domNew = new DOMParser().parseFromString(`<div>${props.initialContent}</div>`, 'text/xml')
  const doc = ProseDOMParser.fromSchema(schema).parse(domNew)

  const initEditor = () => {
    editorViewRef.current = new EditorView(editorElRef.current, {
      state: EditorState.create({
        schema,
        doc: props.initialContent ? doc : null,
        plugins: [
          history(),
          customKeymap(),
          placeholder(props.placeholder),
          keymap({ 'Mod-z': undo, 'Mod-Shift-z': undo, 'Mod-Shift-y': redo, 'Mod-y': redo }),
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
    if (props.clear) {
      clearEditor()
    }
  })

  return (
    <>
      <Show
        when={session()?.user?.slug}
        fallback={
          <div class={styles.signInMessage} id="comments">
            {t('To write a comment, you must')}&nbsp;
            <a href="?modal=auth&mode=register">{t('sign up')}</a>
            &nbsp;{t('or')}&nbsp;
            <a href="?modal=auth&mode=login">{t('sign in')}</a>
          </div>
        }
      >
        <div class={styles.commentEditor}>
          <div
            class={clsx('ProseMirrorOverrides', styles.textarea)}
            ref={(el) => (editorElRef.current = el)}
          />
          <div class={styles.actions}>
            <div class={styles.menu} ref={(el) => (menuElRef.current = el)} />
            <div class={styles.buttons}>
              <Show when={session()?.user?.slug}>
                <Button value={t('Send')} variant="primary" onClick={handleSubmitButtonClick} />
              </Show>
              <Button value={t('cancel')} variant="secondary" onClick={clearEditor} />
            </div>
          </div>
        </div>
      </Show>
    </>
  )
}

export default CommentEditor
