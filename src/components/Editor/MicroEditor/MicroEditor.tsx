import Placeholder from '@tiptap/extension-placeholder'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import clsx from 'clsx'
import { type JSX, Show, createEffect, createSignal, on } from 'solid-js'
import { createEditorTransaction, createTiptapEditor, useEditorHTML, useEditorIsFocused } from 'solid-tiptap'
import { minimal } from '~/lib/editorExtensions'
import { Editor } from '@tiptap/core'

import { Icon } from '~/components/_shared/Icon/Icon'
import { ToolbarControl as Control } from '../EditorToolbar/ToolbarControl'
import { InsertLinkForm } from '../EditorToolbar/InsertLinkForm'

import styles from '../MiniEditor/MiniEditor.module.scss'
import { useLocalize } from '~/context/localize'

interface MicroEditorProps {
  content?: string
  onChange?: (content: string) => void
  onSubmit?: (content: string) => void
  placeholder?: string
  bordered?: boolean
}

export const MicroEditor = (props: MicroEditorProps): JSX.Element => {
  const { t } = useLocalize()
  const [showLinkForm, setShowLinkForm] = createSignal(false)
  const [isActive, setIsActive] = createSignal(false)
  const [editorElement, setEditorElement] = createSignal<HTMLDivElement>()
  const editor = createTiptapEditor(() => ({
    element: editorElement()!,
    extensions: [
      ...minimal,
      Placeholder.configure({ emptyNodeClass: styles.emptyNode, placeholder: props.placeholder })
    ],
    editorProps: {
      attributes: {
        class: styles.simplifiedEditorField
      }
    },
    content: props.content || '',
    autofocus: 'end'
  }))

  const selection = createEditorTransaction(editor, (e?: Editor) => e?.state.selection)
  const html = useEditorHTML(editor)

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
    const updateActive = () => {
      setIsActive(Boolean(selection()) || editor()?.isActive('link') || showLinkForm())
    }
    updateActive()
    editor()?.on('focus', updateActive)
    editor()?.on('blur', updateActive)
    return () => {
      editor()?.off('focus', updateActive)
      editor()?.off('blur', updateActive)
    }
  })

  return (
    <div class={clsx(
      styles.MiniEditor, {
      [styles.bordered]: props.bordered,
      [styles.isFocused]: isActive() && selection() && Boolean(!selection()?.empty)
    })}>
      <div class={styles.controls}>
        <div class={styles.actions}>
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
          <InsertLinkForm
            class={clsx([styles.linkInput, { [styles.linkInputactive]: showLinkForm() }])}
            editor={editor() as Editor}
            onClose={toggleLinkForm}
            onSubmit={setLink}
            onRemove={removeLink}
          />
        </div>
      </div>
      <div id="micro-editor" ref={setEditorElement} style={styles.minimal} />
    </div>
  )
}

export default MicroEditor