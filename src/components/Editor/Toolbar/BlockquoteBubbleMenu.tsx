import type { Editor } from '@tiptap/core'

import { Icon } from '~/components/_shared/Icon'
import { Popover } from '~/components/_shared/Popover'
import { useLocalize } from '~/context/localize'

import styles from './BubbleMenu.module.scss'

type Props = {
  editor: Editor
  ref: (el: HTMLElement) => void
}

export const BlockquoteBubbleMenu = (props: Props) => {
  const { t } = useLocalize()
  return (
    <div ref={props.ref} class={styles.BubbleMenu}>
      <Popover content={t('Alignment left')}>
        {(triggerRef: (el: HTMLElement) => void) => (
          <button
            ref={triggerRef}
            type="button"
            class={styles.bubbleMenuButton}
            onClick={() => {
              props.editor?.chain().focus().setBlockQuoteFloat('left').run()
            }}
          >
            <Icon name="editor-image-align-left" />
          </button>
        )}
      </Popover>
      <Popover content={t('Alignment center')}>
        {(triggerRef: (el: HTMLElement) => void) => (
          <button
            ref={triggerRef}
            type="button"
            class={styles.bubbleMenuButton}
            onClick={() => props.editor?.chain().focus().setBlockQuoteFloat(null).run()}
          >
            <Icon name="editor-image-align-center" />
          </button>
        )}
      </Popover>
      <Popover content={t('Alignment right')}>
        {(triggerRef: (el: HTMLElement) => void) => (
          <button
            ref={triggerRef}
            type="button"
            class={styles.bubbleMenuButton}
            onClick={() => props.editor?.chain().focus().setBlockQuoteFloat('right').run()}
          >
            <Icon name="editor-image-align-right" />
          </button>
        )}
      </Popover>
    </div>
  )
}
