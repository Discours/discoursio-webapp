import { createEffect, createSignal, Show } from 'solid-js'
import type { Editor } from '@tiptap/core'
import styles from './EditorBubbleMenu.module.scss'
import { Icon } from '../_shared/Icon'
import { clsx } from 'clsx'
import { createEditorTransaction } from 'solid-tiptap'
import { useLocalize } from '../../context/localize'
import validateUrl from '../../utils/validateUrl'

type HeadingLevel = 1 | 2 | 3
type ActionName = 'heading' | 'bold' | 'italic' | 'blockquote' | 'isOrderedList' | 'isBulletList'
type BubbleMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

export const EditorBubbleMenu = (props: BubbleMenuProps) => {
  const { t } = useLocalize()
  const [textSizeBubbleOpen, setTextSizeBubbleOpen] = createSignal<boolean>(false)
  const [listBubbleOpen, setListBubbleOpen] = createSignal<boolean>(false)
  const [linkEditorOpen, setLinkEditorOpen] = createSignal<boolean>(false)
  const [url, setUrl] = createSignal<string>('')
  const [prevUrl, setPrevUrl] = createSignal<string | null>(null)
  const [linkError, setLinkError] = createSignal<string | null>(null)

  const activeControl = (action: ActionName, actionLevel?: HeadingLevel, prevLink?: boolean) =>
    createEditorTransaction(
      () => props.editor,
      (editor) => editor && editor.isActive(action, actionLevel && { actionLevel })
    )

  const isLink = createEditorTransaction(
    // вызов этой ф-ии обусловлен не через хэлпер activeControl только проверкой установленна ли ссылка
    () => props.editor,
    (editor) => {
      editor && editor.isActive('link')
      setPrevUrl(editor && editor.getAttributes('link').href)
    }
  )

  const clearLinkForm = () => {
    setUrl('')
    setLinkEditorOpen(false)
  }

  const handleSubmitLink = (e) => {
    e.preventDefault()
    if (url().length > 1 && validateUrl(url())) {
      props.editor.commands.toggleLink({ href: url() })
      clearLinkForm()
    } else {
      setLinkError(t('Invalid url format'))
    }
  }

  const toggleTextSizePopup = () => {
    if (listBubbleOpen()) setListBubbleOpen(false)
    setTextSizeBubbleOpen((prev) => !prev)
  }
  const toggleListPopup = () => {
    if (textSizeBubbleOpen()) setTextSizeBubbleOpen(false)
    setListBubbleOpen((prev) => !prev)
  }

  return (
    <>
      <div ref={props.ref} class={styles.bubbleMenu}>
        {linkEditorOpen() ? (
          <>
            <form onSubmit={(e) => handleSubmitLink(e)} class={styles.linkForm}>
              <input
                type="text"
                placeholder={t('Enter URL address')}
                autofocus
                value={prevUrl() ?? null}
                onChange={(e) => setUrl(e.currentTarget.value)}
              />
              <button type="submit">
                <Icon name="status-done" />
              </button>
              <button type="button" onClick={() => clearLinkForm()}>
                <Icon name="status-cancel" />
              </button>
            </form>
            {linkError() && <div class={styles.linkError}>{linkError()}</div>}
          </>
        ) : (
          <>
            <div class={styles.dropDownHolder}>
              <button
                type="button"
                class={clsx(styles.bubbleMenuButton, {
                  [styles.bubbleMenuButtonActive]: textSizeBubbleOpen()
                })}
                onClick={toggleTextSizePopup}
              >
                <Icon name="editor-text-size" />
                <Icon name="down-triangle" class={styles.triangle} />
              </button>
              <Show when={textSizeBubbleOpen()}>
                <div class={styles.dropDown}>
                  <header>{t('Headers')}</header>
                  <div class={styles.actions}>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: activeControl('heading', 1)()
                      })}
                      onClick={() => props.editor.commands.toggleHeading({ level: 1 })}
                    >
                      <Icon name="editor-h1" />
                    </button>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: activeControl('heading', 2)()
                      })}
                      onClick={() => props.editor.commands.toggleHeading({ level: 2 })}
                    >
                      <Icon name="editor-h2" />
                    </button>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: activeControl('heading', 3)()
                      })}
                      onClick={() => props.editor.commands.toggleHeading({ level: 3 })}
                    >
                      <Icon name="editor-h3" />
                    </button>
                  </div>
                  <header>{t('Quotes')}</header>
                  <div class={styles.actions}>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: activeControl('blockquote')()
                      })}
                      onClick={() => props.editor.chain().focus().toggleBlockquote().run()}
                    >
                      <Icon name="editor-blockquote" />
                    </button>
                  </div>
                </div>
              </Show>
            </div>
            <div class={styles.delimiter} />
            <button
              type="button"
              class={clsx(styles.bubbleMenuButton, {
                [styles.bubbleMenuButtonActive]: activeControl('bold')()
              })}
              onClick={() => props.editor.commands.toggleBold()}
            >
              <Icon name="editor-bold" />
            </button>
            <button
              type="button"
              class={clsx(styles.bubbleMenuButton, {
                [styles.bubbleMenuButtonActive]: activeControl('italic')()
              })}
              onClick={() => props.editor.commands.toggleItalic()}
            >
              <Icon name="editor-italic" />
            </button>
            <div class={styles.delimiter} />
            <button
              type="button"
              onClick={(e) => {
                setLinkEditorOpen(true)
              }}
              class={clsx(styles.bubbleMenuButton, {
                [styles.bubbleMenuButtonActive]: isLink()
              })}
            >
              <Icon name="editor-link" />
            </button>
            <button type="button" class={styles.bubbleMenuButton}>
              <div class={styles.colorWheel} />
            </button>
            <button type="button" class={styles.bubbleMenuButton}>
              <Icon name="editor-footnote" />
            </button>
            <div class={styles.delimiter} />
            <div class={styles.dropDownHolder}>
              <button
                type="button"
                class={clsx(styles.bubbleMenuButton, { [styles.bubbleMenuButtonActive]: listBubbleOpen() })}
                onClick={toggleListPopup}
              >
                <Icon name="editor-ul" />
                <Icon name="down-triangle" class={styles.triangle} />
              </button>
              <Show when={listBubbleOpen()}>
                <div class={styles.dropDown}>
                  <header>{t('Lists')}</header>
                  <div class={styles.actions}>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: activeControl('isBulletList')
                      })}
                      onClick={() => props.editor.commands.toggleBulletList()}
                    >
                      <Icon name="editor-ul" />
                    </button>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: activeControl('isOrderedList')
                      })}
                      onClick={() => props.editor.commands.toggleOrderedList()}
                    >
                      <Icon name="editor-ol" />
                    </button>
                  </div>
                </div>
              </Show>
            </div>
          </>
        )}
      </div>
    </>
  )
}
