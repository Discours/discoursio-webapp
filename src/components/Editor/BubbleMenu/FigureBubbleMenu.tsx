import type { Editor } from '@tiptap/core'
import styles from './FigureBubbleMenu.module.scss'
import { clsx } from 'clsx'
import { Icon } from '../../_shared/Icon'
import { useLocalize } from '../../../context/localize'

type Props = {
  editor: Editor
  ref: (el: HTMLElement) => void
}

export const FigureBubbleMenu = (props: Props) => {
  const { t } = useLocalize()
  return (
    <div ref={props.ref} class={styles.FigureBubbleMenu}>
      <button
        type="button"
        class={clsx(styles.bubbleMenuButton)}
        onClick={() => props.editor.chain().focus().setImageFloat('left').run()}
      >
        <Icon name="editor-image-align-left" />
      </button>
      <button
        type="button"
        class={clsx(styles.bubbleMenuButton)}
        onClick={() => props.editor.chain().focus().setImageFloat(null).run()}
      >
        <Icon name="editor-image-align-center" />
      </button>
      <button
        type="button"
        class={clsx(styles.bubbleMenuButton)}
        onClick={() => props.editor.chain().focus().setImageFloat('right').run()}
      >
        <Icon name="editor-image-align-right" />
      </button>

      <div class={styles.delimiter} />
      <button
        type="button"
        class={clsx(styles.bubbleMenuButton)}
        onClick={() => {
          props.editor.chain().focus().imageToFigure().run()
        }}
      >
        <span style={{ color: 'white' }}>{t('Add signature')}</span>
      </button>
      <div class={styles.delimiter} />
      <button type="button" class={clsx(styles.bubbleMenuButton)}>
        <Icon name="editor-image-add" />
      </button>
    </div>
  )
}
