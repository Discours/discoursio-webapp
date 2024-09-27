import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import clsx from 'clsx'
import { type JSX, Show, createEffect, createSignal, on } from 'solid-js'
import { createEditorTransaction, createTiptapEditor, useEditorHTML } from 'solid-tiptap'
import { base } from '~/lib/editorExtensions'

import { MiniToolbar } from '../EditorToolbar/MiniToolbar'
import styles from '../SimplifiedEditor.module.scss'

interface MiniEditorProps {
  content?: string
  onChange?: (content: string) => void
  onSubmit?: (content: string) => void
  onCancel?: () => void
  limit?: number
  placeholder?: string
}

export default function MiniEditor(props: MiniEditorProps): JSX.Element {
  const [editorElement, setEditorElement] = createSignal<HTMLDivElement>()
  const [counter, setCounter] = createSignal(0)

  const editor = createTiptapEditor(() => ({
    element: editorElement()!,
    extensions: [
      ...base,
      Placeholder.configure({ emptyNodeClass: styles.emptyNode, placeholder: props.placeholder }),
      CharacterCount.configure({ limit: props.limit })
    ],
    editorProps: {
      attributes: {
        class: styles.simplifiedEditorField
      }
    },
    content: props.content || ''
  }))

  const html = useEditorHTML(editor)
  createEffect(on(html, (c?: string) => c && props.onChange?.(c)))

  createEffect(() => {
    const textLength = editor()?.getText().length || 0
    setCounter(textLength)
    const content = html()
    content && props.onChange?.(content)
  })

  const isFocused = createEditorTransaction(editor, (instance) => instance?.isFocused)

  return (
    <div class={clsx(styles.SimplifiedEditor, styles.bordered, { [styles.isFocused]: isFocused() })}>
      <div>
        <div id="mini-editor" ref={setEditorElement} />

        <MiniToolbar editor={editor} />

        <Show when={counter() > 0}>
          <small class={styles.limit}>
            {counter()} / {props.limit || '∞'}
          </small>
        </Show>
      </div>
    </div>
  )
}
