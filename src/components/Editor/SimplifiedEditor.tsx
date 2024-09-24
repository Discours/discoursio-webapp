import { Editor, FocusPosition } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'
import { clsx } from 'clsx'
import { Show, createEffect, createSignal, on, onCleanup, onMount } from 'solid-js'
import { Portal } from 'solid-js/web'
import { createEditorTransaction, useEditorHTML, useEditorIsEmpty, useEditorIsFocused } from 'solid-tiptap'
import { useEditorContext } from '~/context/editor'
import { useUI } from '~/context/ui'
import { base, custom } from '~/lib/editorExtensions'
import { useEscKeyDownHandler } from '~/lib/useEscKeyDownHandler'
import { UploadedFile } from '~/types/upload'
import { Modal } from '../_shared/Modal/Modal'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'
import { ToolbarControls } from './EditorToolbar'
import { LinkBubbleMenuModule } from './LinkBubbleMenu'
import { TextBubbleMenu } from './TextBubbleMenu'
import { UploadModalContent } from './UploadModalContent'
import { renderUploadedImage } from './renderUploadedImage'

import styles from './SimplifiedEditor.module.scss'

export type SimplifiedEditorProps = {
  placeholder: string
  initialContent?: string
  label?: string
  onSubmit?: (text: string) => void
  onCancel?: () => void
  onChange?: (text: string) => void
  variant?: 'minimal' | 'bordered'
  maxLength?: number
  noLimits?: boolean
  maxHeight?: number
  submitButtonText?: string
  quoteEnabled?: boolean
  imageEnabled?: boolean
  setClear?: boolean
  resetToInitial?: boolean
  smallHeight?: boolean
  submitByCtrlEnter?: boolean
  hideToolbar?: boolean
  controlsAlwaysVisible?: boolean
  autoFocus?: boolean
  isCancelButtonVisible?: boolean
  isPosting?: boolean
}

const DEFAULT_MAX_LENGTH = 400

const SimplifiedEditor = (props: SimplifiedEditorProps) => {
  // local signals
  const [counter, setCounter] = createSignal<number>(0)
  const [shouldShowLinkBubbleMenu, setShouldShowLinkBubbleMenu] = createSignal(false)
  const [shouldShowTextBubbleMenu, setShouldShowTextBubbleMenu] = createSignal(false)
  const [editorElement, setEditorElement] = createSignal<HTMLDivElement | undefined>()
  const [textBubbleMenuRef, setTextBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [linkBubbleMenuRef, setLinkBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()

  // contexts
  const { hideModal } = useUI()
  const { editor, createEditor } = useEditorContext()

  const initEditor = (element?: HTMLElement) => {
    if (element instanceof HTMLElement && editor()?.options.element !== element) {
      const opts = {
        element,
        extensions: [
          // common extensions
          ...base,
          ...custom,

          // setup from component props
          Placeholder.configure({ emptyNodeClass: styles.emptyNode, placeholder: props.placeholder }),
          CharacterCount.configure({ limit: props.noLimits ? undefined : props.maxLength }),

          // bubble menu 1
          BubbleMenu.configure({
            pluginKey: 'bubble-menu',
            element: textBubbleMenuRef(),
            shouldShow: ({ view }) => view.hasFocus() && shouldShowTextBubbleMenu()
          }),

          // bubble menu 2
          BubbleMenu.configure({
            pluginKey: 'bubble-link-input',
            element: linkBubbleMenuRef(),
            shouldShow: ({ state }) => !state.selection.empty && shouldShowLinkBubbleMenu(),
            tippyOptions: { placement: 'bottom' }
          })
        ],
        editorProps: {
          attributes: { class: styles.simplifiedEditorField }
        },
        content: props.initialContent || '',
        onCreate: () => console.info('[SimplifiedEditor] created'),
        onContentError: console.error,
        autofocus: (props.autoFocus && 'end') as FocusPosition | undefined,
        editable: true,
        enableCoreExtensions: true,
        enableContentCheck: true,
        injectNonce: undefined, // TODO: can be useful copyright/copyleft mark
        parseOptions: undefined // see: https://prosemirror.net/docs/ref/#model.ParseOptions
      }

      createEditor(opts)
    }
  }

  // editor observers
  const isEmpty = useEditorIsEmpty(editor)
  const isFocused = useEditorIsFocused(editor)
  const selection = createEditorTransaction(editor, (ed) => ed?.state.selection)
  const html = useEditorHTML(editor)

  /// EFFECTS ///

  // Mount event listeners for handling key events and clean up on component unmount
  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown)
      editor()?.destroy()
    })
  })

  // watch changes
  createEffect(on(editorElement, initEditor, { defer: true })) // element -> editorOptions -> set editor
  createEffect(
    on(selection, (s?: Editor['state']['selection']) => s && setShouldShowTextBubbleMenu(!s?.empty))
  )
  createEffect(
    on(
      () => props.setClear,
      (x?: boolean) => x && editor()?.commands.clearContent(true)
    )
  )
  createEffect(
    on(
      () => props.resetToInitial,
      (x?: boolean) => x && editor()?.commands.setContent(props.initialContent || '')
    )
  )
  createEffect(on([html, () => props.onChange], ([c, handler]) => c && handler && handler(c))) // onChange
  createEffect(on(html, (c?: string) => c && setCounter(editor()?.storage.characterCount.characters()))) //counter

  /// HANDLERS ///

  const handleImageRender = (image?: UploadedFile) => {
    image && renderUploadedImage(editor() as Editor, image)
    hideModal()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      isFocused() &&
      !isEmpty() &&
      event.code === 'Enter' &&
      props.submitByCtrlEnter &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault()
      props.onSubmit?.(html() || '')
    }
  }

  const handleHideLinkBubble = () => {
    editor()?.commands.focus()
    setShouldShowLinkBubbleMenu(false)
  }

  useEscKeyDownHandler(handleHideLinkBubble)

  return (
    <ShowOnlyOnClient>
      <div
        class={clsx(styles.SimplifiedEditor, {
          [styles.smallHeight]: props.smallHeight,
          [styles.minimal]: props.variant === 'minimal',
          [styles.bordered]: props.variant === 'bordered',
          [styles.isFocused]: isFocused() || !isEmpty(),
          [styles.labelVisible]: props.label && counter() > 0
        })}
      >
        {/* Display label when applicable */}
        <Show when={props.label && counter() > 0}>
          <div class={styles.label}>{props.label}</div>
        </Show>

        <Show
          when={props.hideToolbar}
          fallback={
            <ToolbarControls {...props} setShouldShowLinkBubbleMenu={setShouldShowLinkBubbleMenu} />
          }
        >
          <TextBubbleMenu
            editor={editor() as Editor}
            ref={setTextBubbleMenuRef}
            shouldShow={shouldShowTextBubbleMenu()}
            isCommonMarkup={true}
          />

          {/* Link bubble menu */}
          <Show when={shouldShowLinkBubbleMenu()}>
            <LinkBubbleMenuModule
              editor={editor() as Editor}
              ref={setLinkBubbleMenuRef}
              onClose={handleHideLinkBubble}
            />
          </Show>
        </Show>

        {/* editor element */}
        <div
          style={
            props.maxHeight
              ? {
                  overflow: 'auto',
                  'max-height': `${props.maxHeight}px`
                }
              : undefined
          }
          ref={setEditorElement}
        />

        {/* Display character limit if maxLength is provided */}
        <Show when={props.maxLength && editor()}>
          <div class={styles.limit}>{(props.maxLength || DEFAULT_MAX_LENGTH) - counter()}</div>
        </Show>

        {/* Image upload modal (show/hide) */}
        <Show when={props.imageEnabled}>
          <Portal>
            <Modal variant="narrow" name="simplifiedEditorUploadImage">
              <UploadModalContent onClose={handleImageRender} />
            </Modal>
          </Portal>
        </Show>
      </div>
    </ShowOnlyOnClient>
  )
}

export default SimplifiedEditor // Export component for lazy loading
