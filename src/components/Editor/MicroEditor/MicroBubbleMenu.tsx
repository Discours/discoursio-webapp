import type { Editor } from '@tiptap/core'
import { clsx } from 'clsx'
import { Show, createEffect, createSignal } from 'solid-js'
import { createEditorTransaction } from 'solid-tiptap'
import { Icon } from '~/components/_shared/Icon'
import { Popover } from '~/components/_shared/Popover'
import { useLocalize } from '~/context/localize'
import { InsertLinkForm } from '../Toolbar/InsertLinkForm'

import styles from './MicroBubbleMenu.module.scss'

type MicroBubbleMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
  hidden: boolean
}

export const MicroBubbleMenu = (props: MicroBubbleMenuProps) => {
  const { t } = useLocalize()

  const isActive = (name: string, attributes?: Record<string, string | number>) =>
    createEditorTransaction(
      () => props.editor,
      (editor) => editor?.isActive(name, attributes)
    )

  const [linkEditorOpen, setLinkEditorOpen] = createSignal(false)
  createEffect(() => props.hidden && setLinkEditorOpen(false))

  const isBold = isActive('bold')
  const isItalic = isActive('italic')
  const isLink = isActive('link')

  const handleOpenLinkForm = () => {
    const { from, to } = props.editor.state.selection
    props.editor?.chain().focus().setTextSelection({ from, to }).run()
    setLinkEditorOpen(true)
  }

  const handleCloseLinkForm = () => {
    setLinkEditorOpen(false)
    // Снимаем выделение, устанавливая курсор в конец текущего выделения
    const { to } = props.editor.state.selection
    props.editor?.chain().focus().setTextSelection(to).run()
  }

  return (
    <div ref={props.ref} class={styles.MicroBubbleMenu}>
      <Show
        when={!linkEditorOpen()}
        fallback={<InsertLinkForm editor={props.editor} onClose={handleCloseLinkForm} />}
      >
        <Popover content={t('Bold')}>
          {(triggerRef: (el: HTMLElement) => void) => (
            <button
              ref={triggerRef}
              type="button"
              class={clsx(styles.bubbleMenuButton, {
                [styles.bubbleMenuButtonActive]: isBold()
              })}
              onClick={() => props.editor?.chain().focus().toggleBold().run()}
            >
              <Icon name="editor-bold" />
            </button>
          )}
        </Popover>
        <Popover content={t('Italic')}>
          {(triggerRef: (el: HTMLElement) => void) => (
            <button
              ref={triggerRef}
              type="button"
              class={clsx(styles.bubbleMenuButton, {
                [styles.bubbleMenuButtonActive]: isItalic()
              })}
              onClick={() => props.editor?.chain().focus().toggleItalic().run()}
            >
              <Icon name="editor-italic" />
            </button>
          )}
        </Popover>
        <Popover content={<div class={styles.noWrap}>{t('Add url')}</div>}>
          {(triggerRef: (el: HTMLElement) => void) => (
            <button
              ref={triggerRef}
              type="button"
              onClick={handleOpenLinkForm}
              class={clsx(styles.bubbleMenuButton, {
                [styles.bubbleMenuButtonActive]: isLink()
              })}
            >
              <Icon name="editor-link" />
            </button>
          )}
        </Popover>
      </Show>
    </div>
  )
}

export default MicroBubbleMenu
