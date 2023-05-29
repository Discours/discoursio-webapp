import type { Editor } from '@tiptap/core'
import styles from './BubbleMenu.module.scss'
import { clsx } from 'clsx'
import { Icon } from '../../_shared/Icon'
import { useLocalize } from '../../../context/localize'
import { Popover } from '../../_shared/Popover'

type Props = {
  editor: Editor
  ref: (el: HTMLElement) => void
}

export const FigureBubbleMenu = (props: Props) => {
  const { t } = useLocalize()
  return (
    <div ref={props.ref} class={styles.BubbleMenu}>
      <Popover content={t('Alignment left')}>
        {(triggerRef: (el) => void) => (
          <button
            ref={triggerRef}
            type="button"
            class={clsx(styles.bubbleMenuButton)}
            onClick={() => props.editor.chain().focus().setImageFloat('left').run()}
          >
            <Icon name="editor-image-align-left" />
          </button>
        )}
      </Popover>
      <Popover content={t('Alignment center')}>
        {(triggerRef: (el) => void) => (
          <button
            ref={triggerRef}
            type="button"
            class={clsx(styles.bubbleMenuButton)}
            onClick={() => props.editor.chain().focus().setImageFloat(null).run()}
          >
            <Icon name="editor-image-align-center" />
          </button>
        )}
      </Popover>
      <Popover content={t('Alignment right')}>
        {(triggerRef: (el) => void) => (
          <button
            ref={triggerRef}
            type="button"
            class={clsx(styles.bubbleMenuButton)}
            onClick={() => props.editor.chain().focus().setImageFloat('right').run()}
          >
            <Icon name="editor-image-align-right" />
          </button>
        )}
      </Popover>
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
      <Popover content={t('Add image')}>
        {(triggerRef: (el) => void) => (
          <button type="button" ref={triggerRef} class={clsx(styles.bubbleMenuButton)}>
            <Icon name="editor-image-add" />
          </button>
        )}
      </Popover>
    </div>
  )
}
