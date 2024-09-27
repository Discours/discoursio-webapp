import { Editor } from '@tiptap/core'
import { Show, createEffect, createSignal, on } from 'solid-js'
import { Icon } from '~/components/_shared/Icon/Icon'
import { useLocalize } from '~/context/localize'
import { useUI } from '~/context/ui'
import { InsertLinkForm } from '../InsertLinkForm/InsertLinkForm'
import { ToolbarControl as Control } from './ToolbarControl'

import { createEditorTransaction } from 'solid-tiptap'
import styles from '../SimplifiedEditor.module.scss'

interface MiniToolbarProps {
  editor?: Editor
}

export const MiniToolbar = (props: MiniToolbarProps) => {
  const { t } = useLocalize()
  const { showModal } = useUI()

  // show / hide for link input
  const [showLinkInput, setShowLinkInput] = createSignal(false)

  // focus on link input when it shows up
  createEffect(on(showLinkInput, (x?: boolean) => x && props.editor?.chain().focus().run()))

  const selection = createEditorTransaction(
    () => props.editor,
    (instance) => instance?.state.selection
  )
  const [storedSelection, setStoredSelection] = createSignal<Editor['state']['selection']>()
  const recoverSelection = () => {
    if (!storedSelection()?.empty) {
      createEditorTransaction(
        () => props.editor,
        (instance?: Editor) => {
          const r = selection()
          if (instance && r) {
            instance.state.selection.from === r.from
            instance.state.selection.to === r.to
          }
        }
      )
    }
  }
  const storeSelection = () => {
    const selection = props.editor?.state.selection
    if (!selection?.empty) {
      setStoredSelection(selection)
    }
  }
  const toggleShowLink = () => {
    if (showLinkInput()) {
      props.editor?.chain().focus().run()
      recoverSelection()
    } else {
      storeSelection()
    }
    setShowLinkInput(!showLinkInput())
  }

  return (
    <div style={{ 'background-color': 'white', display: 'inline-flex' }}>
      <Show when={props.editor} keyed>
        {(instance) => (
          <div class={styles.controls}>
            <div class={styles.actions}>
              <Control
                key="bold"
                editor={instance}
                onChange={() => instance.chain().focus().toggleBold().run()}
                title={t('Bold')}
              >
                <Icon name="editor-bold" />
              </Control>
              <Control
                key="italic"
                editor={instance}
                onChange={() => instance.chain().focus().toggleItalic().run()}
                title={t('Italic')}
              >
                <Icon name="editor-italic" />
              </Control>
              <Control
                key="link"
                editor={instance}
                onChange={toggleShowLink}
                title={t('Add url')}
                isActive={showLinkInput}
              >
                <Icon name="editor-link" />
              </Control>
              <Control
                key="blockquote"
                editor={instance}
                onChange={() => instance.chain().focus().toggleBlockquote().run()}
                title={t('Add blockquote')}
              >
                <Icon name="editor-quote" />
              </Control>
              <Control
                key="image"
                editor={instance}
                onChange={() => showModal('simplifiedEditorUploadImage')}
                title={t('Add image')}
              >
                <Icon name="editor-image-dd-full" />
              </Control>
            </div>
            <Show when={showLinkInput()}>
              <InsertLinkForm editor={instance} onClose={toggleShowLink} />
            </Show>
          </div>
        )}
      </Show>
    </div>
  )
}
