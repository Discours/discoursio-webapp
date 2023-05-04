import type { Editor } from '@tiptap/core'
import styles from './ImageBubbleMenu.module.scss'

type BubbleMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

export const ImageBubbleMenu = (props: BubbleMenuProps) => {
  return (
    <div ref={props.ref} class={styles.bubbleMenu}>
      test
    </div>
  )
}
