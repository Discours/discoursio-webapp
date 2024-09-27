import type { Editor } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import clsx from 'clsx'
import { type JSX, Show, createEffect, createReaction, createSignal, on, onCleanup } from 'solid-js'
import {
  createEditorTransaction,
  createTiptapEditor,
  useEditorHTML,
  useEditorIsEmpty,
  useEditorIsFocused
} from 'solid-tiptap'
import { Icon } from '~/components/_shared/Icon/Icon'
import { Popover } from '~/components/_shared/Popover/Popover'
import { useLocalize } from '~/context/localize'
import { minimal } from '~/lib/editorExtensions'
import { InsertLinkForm } from '../InsertLinkForm/InsertLinkForm'

import styles from '../SimplifiedEditor.module.scss'

interface ControlProps {
  editor: Editor
  title: string
  key: string
  onChange: () => void
  isActive?: (editor: Editor) => boolean
  children: JSX.Element
}

function Control(props: ControlProps): JSX.Element {
  const handleClick = (ev?: MouseEvent) => {
    ev?.preventDefault()
    ev?.stopPropagation()
    props.onChange?.()
  }

  return (
    <Popover content={props.title}>
      {(triggerRef: (el: HTMLElement) => void) => (
        <button
          ref={triggerRef}
          type="button"
          class={clsx(styles.actionButton, { [styles.active]: props.editor.isActive(props.key) })}
          onClick={handleClick}
        >
          {props.children}
        </button>
      )}
    </Popover>
  )
}

interface MicroEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
}

const prevent = (e: Event) => e.preventDefault()

export const MicroEditor = (props: MicroEditorProps): JSX.Element => {
  const { t } = useLocalize()
  const [editorElement, setEditorElement] = createSignal<HTMLDivElement>()
  const [showLinkInput, setShowLinkInput] = createSignal(false)
  const [showSimpleMenu, setShowSimpleMenu] = createSignal(false)
  const [toolbarElement, setToolbarElement] = createSignal<HTMLElement>()

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
    content: props.content || ''
  }))

  const selection = createEditorTransaction(editor, (instance) => instance?.state.selection)
  const [storedSelection, setStoredSelection] = createSignal<Editor['state']['selection']>()
  const recoverSelection = () => {
    if (!storedSelection()?.empty) {
      // TODO set selection range from stored
      createEditorTransaction(editor, (instance?: Editor) => {
        const r = selection()
        if (instance && r) {
          instance.state.selection.from === r.from
          instance.state.selection.to === r.to
        }
      })
    }
  }
  const storeSelection = (event: Event) => {
    event.preventDefault()
    const selection = editor()?.state.selection
    if (!selection?.empty) {
      setStoredSelection(selection)
    }
  }

  const isEmpty = useEditorIsEmpty(editor)
  const isFocused = useEditorIsFocused(editor)
  const html = useEditorHTML(editor)
  createEffect(on([selection, showLinkInput], ([s, l]) => !l && setShowSimpleMenu(!s?.empty)))
  createEffect(on(html, (c?: string) => c && props.onChange?.(c)))
  createEffect(on(showLinkInput, (x?: boolean) => x && editor()?.chain().focus().run()))
  createReaction(on(toolbarElement, (t?: HTMLElement) => t?.addEventListener('mousedown', prevent)))
  onCleanup(() => toolbarElement()?.removeEventListener('mousedown', prevent))

  return (
    <div
      class={clsx(styles.SimplifiedEditor, styles.bordered, {
        [styles.isFocused]: isEmpty() || isFocused()
      })}
    >
      <div>
        <Show when={editor()} keyed>
          {(instance) => (
            <Show when={showSimpleMenu()}>
              <div
                style={{
                  display: 'inline-flex',
                  background: 'var(--editor-bubble-menu-background)',
                  border: '1px solid black'
                }}
                ref={setToolbarElement}
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
                      onChange={() => setShowLinkInput(!showLinkInput())}
                      title={t('Add url')}
                      isActive={showLinkInput}
                    >
                      <Icon name="editor-link" />
                    </Control>
                  </div>
                  <Show when={showLinkInput()}>
                    <InsertLinkForm
                      editor={instance}
                      onClose={() => {
                        setShowLinkInput(false)
                        recoverSelection()
                      }}
                    />
                  </Show>
                </div>
              </div>
            </Show>
          )}
        </Show>

        <div id="micro-editor" ref={setEditorElement} style={styles.minimal} onFocusOut={storeSelection} />
      </div>
    </div>
  )
}

export default MicroEditor
