import Placeholder from '@tiptap/extension-placeholder'
import clsx from 'clsx'
import { type JSX, createEffect, createSignal, on } from 'solid-js'
import { createTiptapEditor, useEditorHTML, useEditorIsEmpty, useEditorIsFocused } from 'solid-tiptap'
import { minimal } from '~/lib/editorExtensions'
import { MicroToolbar } from '../EditorToolbar/MicroToolbar'

import styles from '../SimplifiedEditor.module.scss'

interface MicroEditorProps {
  content?: string
  onChange?: (content: string) => void
  onSubmit?: (content: string) => void
  placeholder?: string
}

export const MicroEditor = (props: MicroEditorProps): JSX.Element => {
  const [editorElement, setEditorElement] = createSignal<HTMLDivElement>()

  const editor = createTiptapEditor(() => ({
    element: editorElement()!,
    extensions: [
      ...minimal,
      Placeholder.configure({ emptyNodeClass: styles.emptyNode, placeholder: props.placeholder })
    ],
    editorProps: {
      attributes: {
        class: styles.simplifiedEditorField
      }
    },
    content: props.content || ''
  }))

  const isEmpty = useEditorIsEmpty(editor)
  const isFocused = useEditorIsFocused(editor)
  const html = useEditorHTML(editor)
  createEffect(on(html, (c?: string) => c && props.onChange?.(c)))

  return (
    <div
      class={clsx(styles.SimplifiedEditor, styles.bordered, {
        [styles.isFocused]: isEmpty() || isFocused()
      })}
    >
      <div>
        <MicroToolbar editor={editor} />

        <div id="micro-editor" ref={setEditorElement} style={styles.minimal} />
      </div>
    </div>
  )
}

export default MicroEditor
