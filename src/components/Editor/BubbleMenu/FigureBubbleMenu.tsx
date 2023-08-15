import type { Editor } from '@tiptap/core'
import styles from './BubbleMenu.module.scss'
import { Icon } from '../../_shared/Icon'
import { useLocalize } from '../../../context/localize'
import { Popover } from '../../_shared/Popover'
import { UploadModalContent } from '../UploadModalContent'
import { Modal } from '../../Nav/Modal'
import { UploadedFile } from '../../../pages/types'
import { renderUploadedImage } from '../../../utils/renderUploadedImage'

type Props = {
  editor: Editor
  ref: (el: HTMLElement) => void
}

export const FigureBubbleMenu = (props: Props) => {
  const { t } = useLocalize()

  const handleUpload = (image: UploadedFile) => {
    renderUploadedImage(props.editor, image)
  }

  return (
    <div ref={props.ref} class={styles.BubbleMenu}>
      <Popover content={t('Alignment left')}>
        {(triggerRef: (el) => void) => (
          <button
            ref={triggerRef}
            type="button"
            class={styles.bubbleMenuButton}
            onClick={() => props.editor.chain().focus().setFigcaptionFocus(true).run()}
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
            class={styles.bubbleMenuButton}
            onClick={() => props.editor.chain().focus().setFigureFloat(null).run()}
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
            class={styles.bubbleMenuButton}
            onClick={() => props.editor.chain().focus().setFigureFloat('right').run()}
          >
            <Icon name="editor-image-align-right" />
          </button>
        )}
      </Popover>
      <div class={styles.delimiter} />
      <button
        type="button"
        class={styles.bubbleMenuButton}
        onClick={() => {
          props.editor.chain().focus().setFigcaptionFocus(true).run()
        }}
      >
        <span style={{ color: 'white' }}>{t('Add signature')}</span>
      </button>
      <div class={styles.delimiter} />
      <Popover content={t('Add image')}>
        {(triggerRef: (el) => void) => (
          <button type="button" ref={triggerRef} class={styles.bubbleMenuButton}>
            <Icon name="editor-image-add" />
          </button>
        )}
      </Popover>

      <Modal variant="narrow" name="uploadImage">
        <UploadModalContent
          onClose={(value) => {
            handleUpload(value)
          }}
        />
      </Modal>
    </div>
  )
}
