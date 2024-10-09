import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import clsx from 'clsx'
import { type JSX, Show, createEffect, createSignal, on } from 'solid-js'
import { createTiptapEditor, useEditorHTML, useEditorIsEmpty } from 'solid-tiptap'
import { Button } from '~/components/_shared/Button'
import { useLocalize } from '~/context/localize'
import { base } from '~/lib/editorExtensions'
import { ToolbarControl as Control } from './Toolbar/ToolbarControl'

import { Editor } from '@tiptap/core'
import { Portal } from 'solid-js/web'
import { UploadModalContent } from '~/components/Upload/UploadModalContent'
import { renderUploadedImage } from '~/components/Upload/renderUploadedImage'
import { Icon } from '~/components/_shared/Icon/Icon'
import { Modal } from '~/components/_shared/Modal'
import { useUI } from '~/context/ui'
import { UploadedFile } from '~/types/upload'
import styles from './MiniEditor.module.scss'
import { InsertLinkForm } from './Toolbar/InsertLinkForm'

interface MiniEditorProps {
  content?: string
  onChange?: (content: string) => void
  onSubmit?: (content: string) => void
  onCancel?: () => void
  limit?: number
  placeholder?: string
}

export function MiniEditor(props: MiniEditorProps): JSX.Element {
  const { t } = useLocalize()
  const { showModal } = useUI()
  const [editorElement, setEditorElement] = createSignal<HTMLDivElement>()
  const [counter, setCounter] = createSignal(0)
  const [showLinkForm, setShowLinkForm] = createSignal(false)
  const editor = createTiptapEditor(() => ({
    element: editorElement()!,
    extensions: [
      ...base,
      Placeholder.configure({ emptyNodeClass: styles.emptyNode, placeholder: props.placeholder }),
      CharacterCount.configure({ limit: props.limit })
    ],
    editorProps: {
      attributes: {
        class: styles.compactEditor
      }
    },
    content: props.content || '',
    autofocus: 'end'
  }))

  const html = useEditorHTML(editor)
  const isEmpty = useEditorIsEmpty(editor)

  const toggleLinkForm = () => {
    setShowLinkForm(!showLinkForm())
    // Если форма закрывается, возвращаем фокус редактору
    !showLinkForm() && editor()?.commands.focus()
  }

  const setLink = (url: string) => {
    url && editor()?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    !url && editor()?.chain().focus().extendMarkRange('link').unsetLink().run()
    setShowLinkForm(false)
  }

  const removeLink = () => {
    editor()?.chain().focus().unsetLink().run()
    setShowLinkForm(false)
  }

  const handleLinkButtonClick = () => {
    if (editor()?.isActive('link')) {
      const previousUrl = editor()?.getAttributes('link').href
      const url = window.prompt('URL', previousUrl)
      url && setLink(url)
    } else {
      toggleLinkForm()
    }
  }

  createEffect(on(html, (c?: string) => c && props.onChange?.(c)))

  createEffect(() => {
    const textLength = editor()?.getText().length || 0
    setCounter(textLength)
    const content = html()
    content && props.onChange?.(content)
  })

  const handleSubmit = () => {
    html() && props.onSubmit?.(html() || '')
    editor()?.commands.clearContent(true)
  }

  return (
    <div class={clsx(styles.MiniEditor, styles.isFocused)}>
      <div class={clsx(styles.controls, styles.isFocused)}>
        <div class={clsx(styles.actions, styles.active)}>
          <Control
            key="bold"
            editor={editor()}
            onChange={() => editor()?.chain().focus().toggleBold().run()}
            title={t('Bold')}
          >
            <Icon name="editor-bold" />
          </Control>
          <Control
            key="italic"
            editor={editor()}
            onChange={() => editor()?.chain().focus().toggleItalic().run()}
            title={t('Italic')}
          >
            <Icon name="editor-italic" />
          </Control>
          <Control
            key="link"
            editor={editor()}
            onChange={handleLinkButtonClick}
            title={t('Add url')}
            isActive={(e: Editor) => Boolean(e?.isActive('link'))}
          >
            <Icon name="editor-link" />
          </Control>
          <Control
            key="blockquote"
            editor={editor()}
            onChange={() => editor()?.chain().focus().toggleBlockquote().run()}
            title={t('Add blockquote')}
          >
            <Icon name="editor-quote" />
          </Control>
          <Control
            key="image"
            editor={editor()}
            onChange={() => showModal('simplifiedEditorUploadImage')}
            title={t('Add image')}
          >
            <Icon name="editor-image-dd-full" />
          </Control>
          <InsertLinkForm
            class={clsx([styles.linkInput, { [styles.linkInputactive]: showLinkForm() }])}
            editor={editor() as Editor}
            onClose={toggleLinkForm}
            onSubmit={setLink}
            onRemove={removeLink}
          />
        </div>
      </div>

      <Portal>
        <Modal variant="narrow" name="simplifiedEditorUploadImage">
          <UploadModalContent
            onClose={(image) => renderUploadedImage(editor() as Editor, image as UploadedFile)}
          />
        </Modal>
      </Portal>

      <div id="mini-editor" ref={setEditorElement} style={styles.minimal} />

      <div class={styles.buttons}>
        <Button
          value={t('Cancel')}
          variant="secondary"
          onClick={() => {
            editor()?.commands.clearContent()
            props.onCancel?.()
          }}
        />
        <Button value={t('Save')} variant="primary" disabled={isEmpty()} onClick={handleSubmit} />
      </div>

      <Show when={counter() > 0}>
        <small class={styles.limit}>
          {counter()} / {props.limit || '∞'}
        </small>
      </Show>
    </div>
  )
}

export default MiniEditor
