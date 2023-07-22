import { createEffect, createSignal, onMount, Show } from 'solid-js'
import { createEditorTransaction, createTiptapEditor, useEditorHTML } from 'solid-tiptap'
import { useEditorContext } from '../../context/editor'
import { Document } from '@tiptap/extension-document'
import { Text } from '@tiptap/extension-text'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Bold } from '@tiptap/extension-bold'
import { Button } from '../_shared/Button'
import { useLocalize } from '../../context/localize'
import { Icon } from '../_shared/Icon'
import { Popover } from '../_shared/Popover'
import { Italic } from '@tiptap/extension-italic'
import { Modal } from '../Nav/Modal'
import { hideModal, showModal } from '../../stores/ui'
import { Link } from '@tiptap/extension-link'
import { Blockquote } from '@tiptap/extension-blockquote'
import { CustomImage } from './extensions/CustomImage'
import { UploadModalContent } from './UploadModalContent'
import { imageProxy } from '../../utils/imageProxy'
import { clsx } from 'clsx'
import styles from './SimplifiedEditor.module.scss'
import { Placeholder } from '@tiptap/extension-placeholder'
import { InsertLinkForm } from './InsertLinkForm'

type Props = {
  initialContent?: string
  onSubmit: (text: string) => void
  placeholder: string
  quoteEnabled?: boolean
  imageEnabled?: boolean
  setClear?: boolean
  smallHeight?: boolean
}

const SimplifiedEditor = (props: Props) => {
  const { t } = useLocalize()
  const [isEmpty, setIsEmpty] = createSignal(true)

  const editorElRef: {
    current: HTMLDivElement
  } = {
    current: null
  }
  const {
    actions: { setEditor }
  } = useEditorContext()

  const editor = createTiptapEditor(() => ({
    element: editorElRef.current,
    extensions: [
      Document,
      Text,
      Paragraph,
      Bold,
      Italic,
      Link.configure({
        openOnClick: false
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: styles.blockQuote
        }
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: styles.uploadedImage
        }
      }),
      Placeholder.configure({
        emptyNodeClass: styles.emptyNode,
        placeholder: props.placeholder
      })
    ],
    content: props.initialContent ?? null,
    onUpdate: () => {
      setIsEmpty(editor().isEmpty)
    }
  }))

  onMount(() => {
    editor().view.dom.classList.add(styles.simplifiedEditorField)
  })

  setEditor(editor)
  const isActive = (name: string, attributes?: unknown) =>
    createEditorTransaction(
      () => editor(),
      (ed) => {
        return ed && ed.isActive(name, attributes)
      }
    )
  const html = useEditorHTML(() => editor())
  const isBold = isActive('bold')
  const isItalic = isActive('italic')
  const isLink = isActive('link')
  const isBlockquote = isActive('blockquote')

  const renderImage = (src: string) => {
    editor()
      .chain()
      .focus()
      .setImage({ src: imageProxy(src) })
      .run()
    hideModal()
  }

  const handleClear = () => {
    editor().commands.clearContent(true)
  }
  createEffect(() => {
    if (props.setClear) {
      editor().commands.clearContent(true)
    }
  })

  // TODO: It is necessary to discuss whether it is worth adding such logic everywhere or only in the messenger?
  // const handleKeyDown = async (event) => {
  //   if (event.keyCode === 13 && event.shiftKey) {
  //     return
  //   }
  //
  //   if (event.keyCode === 13 && !event.shiftKey && !isEmpty()) {
  //     event.preventDefault()
  //     props.onSubmit(html())
  //   }
  // }

  return (
    <div class={clsx(styles.SimplifiedEditor, { [styles.smallHeight]: props.smallHeight })}>
      <div ref={(el) => (editorElRef.current = el)} />
      <div class={styles.controls}>
        <div class={styles.actions}>
          <Popover content={t('Bold')}>
            {(triggerRef: (el) => void) => (
              <button
                ref={triggerRef}
                type="button"
                class={clsx(styles.actionButton, { [styles.active]: isBold() })}
                onClick={() => editor().chain().focus().toggleBold().run()}
              >
                <Icon name="editor-bold" />
              </button>
            )}
          </Popover>
          <Popover content={t('Italic')}>
            {(triggerRef: (el) => void) => (
              <button
                ref={triggerRef}
                type="button"
                class={clsx(styles.actionButton, { [styles.active]: isItalic() })}
                onClick={() => editor().chain().focus().toggleItalic().run()}
              >
                <Icon name="editor-italic" />
              </button>
            )}
          </Popover>
          <Popover content={t('Add url')}>
            {(triggerRef: (el) => void) => (
              <button
                ref={triggerRef}
                type="button"
                onClick={() => showModal('editorInsertLink')}
                class={clsx(styles.actionButton, { [styles.active]: isLink() })}
              >
                <Icon name="editor-link" />
              </button>
            )}
          </Popover>
          <Show when={props.quoteEnabled}>
            <Popover content={t('Add blockquote')}>
              {(triggerRef: (el) => void) => (
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => editor().chain().focus().toggleBlockquote().run()}
                  class={clsx(styles.actionButton, { [styles.active]: isBlockquote() })}
                >
                  <Icon name="editor-quote" />
                </button>
              )}
            </Popover>
          </Show>
          <Show when={props.imageEnabled}>
            <Popover content={t('Add image')}>
              {(triggerRef: (el) => void) => (
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => showModal('uploadImage')}
                  class={clsx(styles.actionButton, { [styles.active]: isBlockquote() })}
                >
                  <Icon name="editor-image-dd-full" />
                </button>
              )}
            </Popover>
          </Show>
        </div>
        <div class={styles.buttons}>
          <Button value={t('cancel')} variant="secondary" disabled={isEmpty()} onClick={handleClear} />
          <Button
            value={t('Send')}
            variant="primary"
            disabled={isEmpty()}
            onClick={() => props.onSubmit(html())}
          />
        </div>
      </div>
      <Modal variant="narrow" name="editorInsertLink">
        <InsertLinkForm editor={editor()} />
      </Modal>
      <Show when={props.imageEnabled}>
        <Modal variant="narrow" name="uploadImage">
          <UploadModalContent
            onClose={(value) => {
              renderImage(value)
            }}
          />
        </Modal>
      </Show>
    </div>
  )
}

export default SimplifiedEditor // "export default" need to use for asynchronous (lazy) imports in the comments tree
