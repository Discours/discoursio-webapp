import { Blockquote } from '@tiptap/extension-blockquote'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { clsx } from 'clsx'
import { Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { Portal } from 'solid-js/web'
import {
  createEditorTransaction,
  createTiptapEditor,
  useEditorHTML,
  useEditorIsEmpty,
  useEditorIsFocused
} from 'solid-tiptap'

import { useLocalize } from '~/context/localize'
import { UploadedFile } from '~/types/upload'
import { Button } from '../_shared/Button'
import { Icon } from '../_shared/Icon'
import { Loading } from '../_shared/Loading'
import { Popover } from '../_shared/Popover'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'
import { LinkBubbleMenuModule } from './LinkBubbleMenu'
import { TextBubbleMenu } from './TextBubbleMenu'
import { UploadModalContent } from './UploadModalContent'
import { Figcaption } from './extensions/Figcaption'
import { Figure } from './extensions/Figure'

import { Editor } from '@tiptap/core'
import { useUI } from '~/context/ui'
import { base } from '~/lib/editorOptions'
import { Modal } from '../_shared/Modal/Modal'
import styles from './SimplifiedEditor.module.scss'
import { renderUploadedImage } from './renderUploadedImage'

type Props = {
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
  onlyBubbleControls?: boolean
  controlsAlwaysVisible?: boolean
  autoFocus?: boolean
  isCancelButtonVisible?: boolean
  isPosting?: boolean
}

const DEFAULT_MAX_LENGTH = 400
const ImageFigure = Figure.extend({ name: 'capturedImage', content: 'figcaption image' })

const SimplifiedEditor = (props: Props) => {
  const { t } = useLocalize()
  const { showModal, hideModal } = useUI()
  const [counter, setCounter] = createSignal<number>(0)
  const [shouldShowLinkBubbleMenu, setShouldShowLinkBubbleMenu] = createSignal(false)
  const isCancelButtonVisible = createMemo(() => props.isCancelButtonVisible !== false)
  const [editorElement, setEditorElement] = createSignal<HTMLDivElement>()
  const editor = createTiptapEditor(() => ({
    element: editorElement()!,
    extensions: [
      ...base,
      Placeholder.configure({ emptyNodeClass: styles.emptyNode, placeholder: props.placeholder }),
      CharacterCount.configure({ limit: props.noLimits ? undefined : props.maxLength }),
      Link.extend({ inclusive: false }).configure({ autolink: true, openOnClick: false }),
      Blockquote.configure({ HTMLAttributes: { class: styles.blockQuote } }),
      BubbleMenu.configure({
        pluginKey: 'textBubbleMenu',
        element: textBubbleMenuRef(),
        shouldShow: ({ view, state }) =>
          Boolean(props.onlyBubbleControls && view.hasFocus() && !state.selection.empty)
      }),
      BubbleMenu.configure({
        pluginKey: 'linkBubbleMenu',
        element: linkBubbleMenuRef(),
        shouldShow: ({ state }) => !state.selection.empty && shouldShowLinkBubbleMenu(),
        tippyOptions: { placement: 'bottom' }
      }),
      ImageFigure,
      Image,
      Figcaption
    ],
    editorProps: {
      attributes: {
        class: styles.simplifiedEditorField
      }
    },
    content: props.initialContent || ''
  }))

  const [textBubbleMenuRef, setTextBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [linkBubbleMenuRef, setLinkBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const isEmpty = useEditorIsEmpty(editor)
  const isFocused = useEditorIsFocused(editor)
  const isActive = (name: string) => createEditorTransaction(editor, (ed) => ed?.isActive(name))
  const html = useEditorHTML(editor)
  const isBold = isActive('bold')
  const isItalic = isActive('italic')
  const isLink = isActive('link')
  const isBlockquote = isActive('blockquote')

  const renderImage = (image: UploadedFile) => {
    renderUploadedImage(editor() as Editor, image)
    hideModal()
  }

  const handleClear = () => {
    props.onCancel?.()
    editor()?.commands.clearContent(true)
  }

  createEffect(() => {
    if (props.setClear) {
      editor()?.commands.clearContent(true)
    }
    if (props.resetToInitial) {
      editor()?.commands.clearContent(true)
      if (props.initialContent) editor()?.commands.setContent(props.initialContent)
    }
  })

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isEmpty() || !isFocused()) {
      return
    }

    if (event.code === 'Escape' && editor()) {
      handleHideLinkBubble()
    }

    if (event.code === 'Enter' && props.submitByCtrlEnter && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      props.onSubmit?.(html() || '')
      handleClear()
    }

    // if (event.code === 'KeyK' && (event.metaKey || event.ctrlKey) && !editor().state.selection.empty) {
    //   event.preventDefault()
    //   handleShowLinkBubble()
    //
    // }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown)
      editor()?.destroy()
    })
  })

  if (props.onChange) {
    createEffect(() => {
      props.onChange?.(html() || '')
    })
  }

  createEffect(() => {
    if (html()) {
      setCounter(editor()?.storage.characterCount.characters())
    }
  })

  const maxHeightStyle = {
    overflow: 'auto',
    'max-height': `${props.maxHeight}px`
  }

  const handleShowLinkBubble = () => {
    editor()?.chain().focus().run()
    setShouldShowLinkBubbleMenu(true)
  }

  const handleHideLinkBubble = () => {
    editor()?.commands.focus()
    setShouldShowLinkBubbleMenu(false)
  }

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
        <Show when={props.maxLength && editor()}>
          <div class={styles.limit}>{(props.maxLength || DEFAULT_MAX_LENGTH) - counter()}</div>
        </Show>
        <Show when={props.label && counter() > 0}>
          <div class={styles.label}>{props.label}</div>
        </Show>
        <div style={props.maxHeight ? maxHeightStyle : undefined} ref={setEditorElement} />
        <Show when={!props.onlyBubbleControls}>
          <div class={clsx(styles.controls, { [styles.alwaysVisible]: props.controlsAlwaysVisible })}>
            <div class={styles.actions}>
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
            <Show when={!props.onChange}>
              <div class={styles.buttons}>
                <Show when={isCancelButtonVisible()}>
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
        <Show when={props.imageEnabled}>
          <Portal>
            <Modal variant="narrow" name="simplifiedEditorUploadImage">
              <UploadModalContent
                onClose={(value) => {
                  renderImage(value as UploadedFile)
                }}
              />
            </Modal>
          </Portal>
        </Show>
        <Show when={props.onlyBubbleControls}>
          <TextBubbleMenu
            shouldShow={true}
            isCommonMarkup={true}
            editor={editor() as Editor}
            ref={setTextBubbleMenuRef}
          />
        </Show>
        <LinkBubbleMenuModule
          editor={editor() as Editor}
          ref={setLinkBubbleMenuRef}
          onClose={handleHideLinkBubble}
        />
      </div>
    </ShowOnlyOnClient>
  )
}

export default SimplifiedEditor // "export default" need to use for asynchronous (lazy) imports in the comments tree
