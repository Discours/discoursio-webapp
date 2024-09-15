import type { Editor } from '@tiptap/core'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import clsx from 'clsx'
import { type JSX, Show, createEffect, createSignal, onCleanup } from 'solid-js'
import {
  createEditorTransaction,
  createTiptapEditor,
  useEditorHTML,
  useEditorIsEmpty,
  useEditorIsFocused
} from 'solid-tiptap'
import { Toolbar } from 'terracotta'

import { useLocalize } from '~/context/localize'
import { useUI } from '~/context/ui'
import { base, custom } from '~/lib/editorOptions'
import { Icon } from '../_shared/Icon/Icon'
import { Popover } from '../_shared/Popover/Popover'
import { InsertLinkForm } from './InsertLinkForm/InsertLinkForm'

import styles from './SimplifiedEditor.module.scss'

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

interface MiniEditorProps {
  content?: string
  onChange?: (content: string) => void
  limit?: number
  placeholder?: string
}

export default function MiniEditor(props: MiniEditorProps): JSX.Element {
  const [editorElement, setEditorElement] = createSignal<HTMLDivElement>()
  const [counter, setCounter] = createSignal(0)
  const [showLinkInput, setShowLinkInput] = createSignal(false)
  const [showSimpleMenu, setShowSimpleMenu] = createSignal(false)
  const { t } = useLocalize()
  const { showModal } = useUI()

  const editor = createTiptapEditor(() => ({
    element: editorElement()!,
    extensions: [
      ...base,
      ...custom,
      Placeholder.configure({ emptyNodeClass: styles.emptyNode, placeholder: props.placeholder }),
      CharacterCount.configure({ limit: props.limit })
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

  createEffect(() => setShowSimpleMenu(isTextSelection()))

  createEffect(() => {
    const textLength = editor()?.getText().length || 0
    setCounter(textLength)
    const content = html()
    content && props.onChange?.(content)
  })

  const handleLinkClick = () => {
    setShowLinkInput(!showLinkInput())
    editor()?.chain().focus().run()
  }

  // Prevent focus loss when clicking inside the toolbar
  const handleMouseDownOnToolbar = (event: MouseEvent) => {
    event.preventDefault() // Prevent the default focus shift
  }
  const [toolbarElement, setToolbarElement] = createSignal<HTMLElement>()
  // Attach the event handler to the toolbar
  onCleanup(() => {
    toolbarElement()?.removeEventListener('mousedown', handleMouseDownOnToolbar)
  })
  return (
    <div
      class={clsx(styles.SimplifiedEditor, styles.bordered, {
        [styles.isFocused]: isEmpty() || isFocused()
      })}
    >
      <div>
        <Show when={showSimpleMenu() || showLinkInput()}>
          <Toolbar style={{ 'background-color': 'white' }} ref={setToolbarElement} horizontal>
            <Show when={editor()} keyed>
              {(instance) => (
                <div class={styles.controls}>
                  <Show
                    when={!showLinkInput()}
                    fallback={<InsertLinkForm editor={instance} onClose={() => setShowLinkInput(false)} />}
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
                        onChange={handleLinkClick}
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
                  </Show>
                </div>
              )}
            </Show>
          </Toolbar>
        </Show>

        <div id="mini-editor" ref={setEditorElement} />

        <Show when={counter() > 0}>
          <small class={styles.limit}>
            {counter()} / {props.limit || '∞'}
          </small>
        </Show>
      </div>
    </div>
  )
}
