import { createEffect, createSignal } from 'solid-js'
import { createEditorTransaction, createTiptapEditor, useEditorHTML } from 'solid-tiptap'
import { useEditorContext } from '../../context/editor'
import { Document } from '@tiptap/extension-document'
import { Text } from '@tiptap/extension-text'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Bold } from '@tiptap/extension-bold'
import styles from './SimplifiedEditor.module.scss'
import { Button } from '../_shared/Button'
import { useLocalize } from '../../context/localize'
import { clsx } from 'clsx'
import { Icon } from '../_shared/Icon'
import { Popover } from '../_shared/Popover'
import { Italic } from '@tiptap/extension-italic'
import { Modal } from '../Nav/Modal'
import { hideModal, showModal } from '../../stores/ui'
import { validateUrl } from '../../utils/validateUrl'
import { InlineForm } from './InlineForm'
import { checkUrl } from './utils/checkUrl'
import { Link } from '@tiptap/extension-link'
import { Blockquote } from '@tiptap/extension-blockquote'

type Props = {
  initialContent?: string
  onChange: (text: string) => void
}

export const SimplifiedEditor = (props: Props) => {
  const { t } = useLocalize()

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
      })
    ],
    content: `<p>Example Text</p>`
  }))

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

  const currentUrl = createEditorTransaction(
    () => editor(),
    (ed) => {
      return (ed && ed.getAttributes('link').href) || ''
    }
  )
  const handleClearLinkForm = () => {
    if (currentUrl()) {
      editor().chain().focus().unsetLink().run()
    }
  }

  const handleLinkFormSubmit = (value: string) => {
    editor()
      .chain()
      .focus()
      .setLink({ href: checkUrl(value) })
      .run()
  }

  return (
    <div class={styles.SimplifiedEditor}>
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
          <Popover content={t('Add blockquote')}>
            {(triggerRef: (el) => void) => (
              <button
                ref={triggerRef}
                type="button"
                onClick={() => editor().chain().focus().toggleBlockquote().run()}
                class={clsx(styles.actionButton, { [styles.active]: isLink() })}
              >
                <Icon name="editor-quote" />
              </button>
            )}
          </Popover>
        </div>
        <div class={styles.buttons}>
          <Button value={t('cancel')} variant="secondary" />
          <Button
            value={t('Send')}
            variant="primary"
            onClick={() => {
              console.log('!!! :', html())
            }}
          />
        </div>
      </div>
      <Modal
        variant="narrow"
        name="editorInsertLink"
        onClose={() => {
          console.log('!!! :')
        }}
      >
        <InlineForm
          placeholder={t('Enter URL address')}
          initialValue={currentUrl() ?? ''}
          onClear={handleClearLinkForm}
          validate={(value) => (validateUrl(value) ? '' : t('Invalid url format'))}
          onSubmit={handleLinkFormSubmit}
          onClose={() => hideModal()}
        />
      </Modal>
    </div>
  )
}
