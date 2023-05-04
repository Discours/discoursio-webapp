import type { Editor } from '@tiptap/core'
import styles from './ImageBubbleMenu.module.scss'
import { clsx } from 'clsx'
import { Icon } from '../../_shared/Icon'

type BubbleMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

export const ImageBubbleMenu = (props: BubbleMenuProps) => {
  return (
    <div ref={props.ref} class={styles.ImageBubbleMenu}>
      <button type="button" class={clsx(styles.bubbleMenuButton)}>
        <Icon name="editor-image-align-left" />
      </button>
      <button type="button" class={clsx(styles.bubbleMenuButton)}>
        <Icon name="editor-image-align-center" />
      </button>
      <button type="button" class={clsx(styles.bubbleMenuButton)}>
        <Icon name="editor-image-align-right" />
      </button>
      <div class={styles.delimiter} />
      <button type="button" class={clsx(styles.bubbleMenuButton)}>
        <Icon name="editor-image-align-add" />
      </button>
    </div>
  )
}
