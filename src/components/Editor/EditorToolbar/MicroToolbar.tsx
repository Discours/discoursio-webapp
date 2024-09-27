import { Editor } from '@tiptap/core'
import { Accessor, Show, createEffect, createSignal, on } from 'solid-js'
import { createEditorTransaction } from 'solid-tiptap'
import { Icon } from '~/components/_shared/Icon/Icon'
import { useLocalize } from '~/context/localize'
import { InsertLinkForm } from '../InsertLinkForm/InsertLinkForm'
import { ToolbarControl as Control } from './ToolbarControl'

import styles from '../SimplifiedEditor.module.scss'

export interface MicroToolbarProps {
  showing?: boolean
  editor: Accessor<Editor|undefined>
}

export const MicroToolbar = (props: MicroToolbarProps) => {
  const { t } = useLocalize()

  // show / hide for menu
  const [showSimpleMenu, setShowSimpleMenu] = createSignal(!props.showing)
  const selection = createEditorTransaction(
    props.editor,
    (instance) => instance?.state.selection
  )

  // show / hide for link input
  const [showLinkInput, setShowLinkInput] = createSignal(false)

  // change visibility on selection if not in link input mode
  createEffect(on([selection, showLinkInput], ([s, l]) => !l && setShowSimpleMenu(!s?.empty)))

  // focus on link input when it shows up
  createEffect(on(showLinkInput, (x?: boolean) => x && props.editor()?.chain().focus().run()))

  const [storedSelection, setStoredSelection] = createSignal<Editor['state']['selection']>()
  const recoverSelection = () => {
    if (!storedSelection()?.empty) {
      createEditorTransaction(
        props.editor,
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
    const selection = props.editor()?.state.selection
    if (!selection?.empty) {
      setStoredSelection(selection)
    }
  }
  const toggleShowLink = () => {
    if (showLinkInput()) {
      props.editor()?.chain().focus().run()
      recoverSelection()
    } else {
      storeSelection()
    }
    setShowLinkInput(!showLinkInput())
  }
  return (
    <Show when={props.editor()} keyed>
      {(instance) => (
        <Show when={!showSimpleMenu()}>
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--editor-bubble-menu-background)',
              border: '1px solid black'
            }}
          >
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
              </div>
              <Show when={showLinkInput()}>
                <InsertLinkForm editor={instance} onClose={toggleShowLink} />
              </Show>
            </div>
          </div>
        </Show>
      )}
    </Show>
  )
}
