import BubbleMenu from '@tiptap/extension-bubble-menu'
import Placeholder from '@tiptap/extension-placeholder'
import clsx from 'clsx'
import { type JSX, createEffect, createSignal, on } from 'solid-js'
import { createTiptapEditor, useEditorHTML } from 'solid-tiptap'
import { minimal } from '~/lib/editorExtensions'
import { MicroBubbleMenu } from './Toolbar/MicroBubbleMenu'

import styles from './MiniEditor.module.scss'

interface MicroEditorProps {
  content?: string
  onChange?: (content: string) => void
  onSubmit?: (content: string) => void
  placeholder?: string
  bordered?: boolean
}

export const MicroEditor = (props: MicroEditorProps): JSX.Element => {
  const [editorElement, setEditorElement] = createSignal<HTMLDivElement>()
  const [bubbleMenuElement, setBubbleMenuElement] = createSignal<HTMLDivElement>()

  const editor = createTiptapEditor(() => ({
    element: editorElement()!,
    extensions: [
      ...minimal,
      Placeholder.configure({ emptyNodeClass: styles.emptyNode, placeholder: props.placeholder }),
      BubbleMenu.configure({
        element: bubbleMenuElement()!,
        shouldShow: ({ state: { selection }, editor }) => !selection.empty || editor.isActive('link')
      })
    ],
    editorProps: {
      attributes: {
        class: styles.compactEditor
      }
    },
    content: props.content || '',
    autofocus: 'end'
  }))

  const html = useEditorHTML(editor)

  createEffect(on(html, (c?: string) => c && props.onChange?.(c)))

  return (
    <div
      class={clsx(styles.MiniEditor, {
        [styles.bordered]: props.bordered
      })}
    >
      <MicroBubbleMenu
        editor={editor()!}
        ref={setBubbleMenuElement}
        hidden={!!editor()?.state.selection.empty}
      />
      <div id="micro-editor" ref={setEditorElement} style={styles.minimal} />
    </div>
  )
}

export default MicroEditor
