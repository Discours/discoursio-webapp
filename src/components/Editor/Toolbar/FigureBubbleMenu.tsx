import type { Editor } from '@tiptap/core'
import { renderUploadedImage } from '~/components/Upload/renderUploadedImage'
import { Icon } from '~/components/_shared/Icon'
import { Popover } from '~/components/_shared/Popover'
import { useLocalize } from '~/context/localize'
import { useUI } from '~/context/ui'
import { UploadedFile } from '~/types/upload'
import { UploadModalContent } from '../../Upload/UploadModalContent'
import { Modal } from '../../_shared/Modal'

import styles from './BubbleMenu.module.scss'

type Props = {
  editor: Editor
  ref: (el: HTMLElement) => void
}

export const FigureBubbleMenu = (props: Props) => {
  const { t } = useLocalize()
  const { hideModal } = useUI()

  const handleUpload = (image?: UploadedFile) => {
    image && renderUploadedImage(props.editor, image)
    hideModal()
  }

  return (
    <div ref={props.ref} class={styles.BubbleMenu}>
      <Popover content={t('Alignment left')}>
        {(triggerRef: (el: HTMLElement) => void) => (
          <button
            ref={triggerRef}
            type="button"
            class={styles.bubbleMenuButton}
            onClick={() => props.editor?.chain().focus().setFigureFloat('left').run()}
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
            onClick={() => props.editor?.chain().focus().setFigureFloat(null).run()}
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
            onClick={() => props.editor?.chain().focus().setFigureFloat('right').run()}
          >
            <Icon name="editor-image-align-right" />
          </button>
        )}
      </Popover>
      <div class={styles.delimiter} />
      <button
        type="button"
        class={styles.bubbleMenuButton}
        onClick={() => props.editor?.chain().focus().setFigcaptionFocus(true).run()}
      >
        <span style={{ color: 'white' }}>{t('Add signature')}</span>
      </button>
      <div class={styles.delimiter} />
      <Popover content={t('Add image')}>
        {(triggerRef: (el: HTMLElement) => void) => (
          <button type="button" ref={triggerRef} class={styles.bubbleMenuButton}>
            <Icon name="editor-image-add" />
          </button>
        )}
      </Popover>

      <Modal variant="narrow" name="uploadImage">
        <UploadModalContent onClose={handleUpload} />
      </Modal>
    </div>
  )
}
