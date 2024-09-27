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
  const [selectionRange, setSelectionRange] = createSignal<Range | null>(null)

  const handleLinkInputFocus = (event: FocusEvent) => {
    event.preventDefault()
    const selection = window.getSelection()
    if (selection?.rangeCount) {
      setSelectionRange(selection.getRangeAt(0))
    }
  }

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

  const isEmpty = useEditorIsEmpty(editor)
  const isFocused = useEditorIsFocused(editor)
  const isTextSelection = createEditorTransaction(editor, (instance) => !instance?.state.selection.empty)
  const html = useEditorHTML(editor)

  createEffect(on([isTextSelection, showLinkInput],([selected, linkEditing]) => !linkEditing && setShowSimpleMenu(selected)))
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
                  <Show
                    when={!showLinkInput()}
                    fallback={<InsertLinkForm editor={instance}
                    onClose={() => {
                      setShowLinkInput(false)
                      if (selectionRange()) {
                        const selection = window.getSelection()
                        selection?.removeAllRanges()
                        selection?.addRange(selectionRange()!)
                      }
                    }}
                    onFocus={handleLinkInputFocus} />}
                  >
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
                  </Show>
                </div>
              </div>
            </Show>
          )}
        </Show>

        <div id="micro-editor" ref={setEditorElement} style={styles.minimal} />
      </div>
    </div>
  )
}

export default MicroEditor
