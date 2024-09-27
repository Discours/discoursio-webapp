import clsx from 'clsx'
import { Show } from 'solid-js'
import { createEditorTransaction, useEditorHTML, useEditorIsEmpty } from 'solid-tiptap'
import { useEditorContext } from '~/context/editor'
import { useLocalize } from '~/context/localize'
import { useUI } from '~/context/ui'
import { Button } from '../../_shared/Button'
import { Icon } from '../../_shared/Icon'
import { Loading } from '../../_shared/Loading'
import { Popover } from '../../_shared/Popover'
import { SimplifiedEditorProps } from '../SimplifiedEditor'

import styles from '../SimplifiedEditor.module.scss'

export const ToolbarControls = (
  props: SimplifiedEditorProps & { setShouldShowLinkBubbleMenu: (x: boolean) => void }
) => {
  const { t } = useLocalize()
  const { showModal } = useUI()
  const { editor } = useEditorContext()
  const isActive = (name: string) => createEditorTransaction(editor, (ed) => ed?.isActive(name))
  const isBold = isActive('bold')
  const isItalic = isActive('italic')
  const isLink = isActive('link')
  const isBlockquote = isActive('blockquote')
  const isEmpty = useEditorIsEmpty(editor)
  const html = useEditorHTML(editor)

  const handleClear = () => {
    props.onCancel?.()
    editor()?.commands.clearContent(true)
  }

  const handleShowLinkBubble = () => {
    editor()?.chain().focus().run()
    props.setShouldShowLinkBubbleMenu(true)
  }

  return (
    <Show when={!props.hideToolbar}>
      {/* Only show controls if 'hideToolbar' is false */}
      <div class={clsx(styles.controls, { [styles.alwaysVisible]: props.controlsAlwaysVisible })}>
        <div class={styles.actions}>
          {/* Bold button */}
          <Popover content={t('Bold')}>
            {(triggerRef: (el: HTMLElement) => void) => (
              <button
                ref={triggerRef}
                type="button"
                class={clsx(styles.actionButton, { [styles.active]: isBold() })}
                onClick={() => editor()?.chain().focus().toggleBold().run()}
              >
                <Icon name="editor-bold" />
              </button>
            )}
          </Popover>
          {/* Italic button */}
          <Popover content={t('Italic')}>
            {(triggerRef) => (
              <button
                ref={triggerRef}
                type="button"
                class={clsx(styles.actionButton, { [styles.active]: isItalic() })}
                onClick={() => editor()?.chain().focus().toggleItalic().run()}
              >
                <Icon name="editor-italic" />
              </button>
            )}
          </Popover>
          {/* Link button */}
          <Popover content={t('Add url')}>
            {(triggerRef) => (
              <button
                ref={triggerRef}
                type="button"
                onClick={handleShowLinkBubble}
                class={clsx(styles.actionButton, { [styles.active]: isLink() })}
              >
                <Icon name="editor-link" />
              </button>
            )}
          </Popover>
          {/* Blockquote button (optional) */}
          <Show when={props.quoteEnabled}>
            <Popover content={t('Add blockquote')}>
              {(triggerRef) => (
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => editor()?.chain().focus().toggleBlockquote().run()}
                  class={clsx(styles.actionButton, { [styles.active]: isBlockquote() })}
                >
                  <Icon name="editor-quote" />
                </button>
              )}
            </Popover>
          </Show>
          {/* Image button (optional) */}
          <Show when={props.imageEnabled}>
            <Popover content={t('Add image')}>
              {(triggerRef) => (
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => showModal('simplifiedEditorUploadImage')}
                  class={clsx(styles.actionButton, { [styles.active]: isBlockquote() })}
                >
                  <Icon name="editor-image-dd-full" />
                </button>
              )}
            </Popover>
          </Show>
        </div>
        {/* Cancel and submit buttons */}
        <Show when={!props.onChange}>
          <div class={styles.buttons}>
            <Show when={props.isCancelButtonVisible}>
              <Button value={t('Cancel')} variant="secondary" onClick={handleClear} />
            </Show>
            <Show when={!props.isPosting} fallback={<Loading />}>
              <Button
                value={props.submitButtonText ?? t('Send')}
                variant="primary"
                disabled={isEmpty()}
                onClick={() => props.onSubmit?.(html() || '')}
              />
            </Show>
          </div>
        </Show>
      </div>
    </Show>
  )
}
