import type { Editor } from '@tiptap/core'
import styles from './EditorBubbleMenu.module.scss'
import { Icon } from '../_shared/Icon'
import { clsx } from 'clsx'
import { createEditorTransaction } from 'solid-tiptap'

type BubbleMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

export const EditorBubbleMenu = (props: BubbleMenuProps) => {
  const isBold = createEditorTransaction(
    () => props.editor,
    (editor) => editor && editor.isActive('bold')
  )

  return (
    <div ref={props.ref} class={styles.bubbleMenu}>
      <button class={clsx(styles.bubbleMenuButton)}>
        <Icon name="editor-text-size" />
      </button>
      <button
        class={clsx(styles.bubbleMenuButton, {
          [styles.bubbleMenuButtonActive]: isBold()
        })}
        onClick={(e) => {
          e.preventDefault()
          props.editor.commands.toggleBold()
        }}
      >
        <Icon name="editor-bold" />
      </button>
      <button class={styles.bubbleMenuButton}>
        <Icon name="editor-italic" />
      </button>
      <div class={styles.delimiter}></div>
      <button class={styles.bubbleMenuButton}>
        <Icon name="editor-link" />
      </button>
      <button class={styles.bubbleMenuButton}>
        <Icon name="editor-footnote" />
      </button>
      <div class={styles.delimiter}></div>
      <button class={styles.bubbleMenuButton}>
        <Icon name="editor-ul" />
      </button>
    </div>
  )
}
