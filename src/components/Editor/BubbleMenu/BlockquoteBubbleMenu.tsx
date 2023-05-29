import type { Editor } from '@tiptap/core'
import styles from './FigureBubbleMenu.module.scss'
import { clsx } from 'clsx'
import { Icon } from '../../_shared/Icon'
import { useLocalize } from '../../../context/localize'

type Props = {
  editor: Editor
  ref: (el: HTMLElement) => void
}

export const BlockquoteBubbleMenu = (props: Props) => {
  return (
    <div ref={props.ref} class={styles.FigureBubbleMenu}>
      <button
        type="button"
        class={clsx(styles.bubbleMenuButton)}
        onClick={() => {
          props.editor.chain().focus().setBlockQuoteFloat('left').run()
        }}
      >
        <Icon name="editor-image-align-left" />
      </button>
      <button
        type="button"
        class={clsx(styles.bubbleMenuButton)}
        onClick={() => props.editor.chain().focus().setBlockQuoteFloat(null).run()}
      >
        <Icon name="editor-image-align-center" />
      </button>
      <button
        type="button"
        class={clsx(styles.bubbleMenuButton)}
        onClick={() => props.editor.chain().focus().setBlockQuoteFloat('right').run()}
      >
        <Icon name="editor-image-align-right" />
      </button>
    </div>
  )
}
