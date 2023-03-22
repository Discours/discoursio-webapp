import { createEffect, createSignal, Show } from 'solid-js'
import type { Editor } from '@tiptap/core'
import styles from './EditorBubbleMenu.module.scss'
import { Icon } from '../_shared/Icon'
import { clsx } from 'clsx'
import { createEditorTransaction } from 'solid-tiptap'
import { useLocalize } from '../../context/localize'
import validateUrl from '../../utils/validateUrl'

type BubbleMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

export const EditorBubbleMenu = (props: BubbleMenuProps) => {
  const { t } = useLocalize()
  const [textSizeBubbleOpen, setTextSizeBubbleOpen] = createSignal<boolean>(false)
  const [linkEditorOpen, setLinkEditorOpen] = createSignal<boolean>(false)
  const [url, setUrl] = createSignal<string>('')
  const [prevUrl, setPrevUrl] = createSignal<string | null>(null)
  const [linkError, setLinkError] = createSignal<string | null>(null)

  const isBold = createEditorTransaction(
    () => props.editor,
    (editor) => editor && editor.isActive('bold')
  )
  const isItalic = createEditorTransaction(
    () => props.editor,
    (editor) => editor && editor.isActive('italic')
  )

  //props.editor.isActive('heading', { level: 1 }) - либо инлайново либо как-то возвращать что активно
  const isHOne = createEditorTransaction(
    () => props.editor,
    (editor) => editor && editor.isActive('heading', { level: 1 })
  )
  const isHTwo = createEditorTransaction(
    () => props.editor,
    (editor) => editor && editor.isActive('heading', { level: 2 })
  )
  const isHThree = createEditorTransaction(
    () => props.editor,
    (editor) => editor && editor.isActive('heading', { level: 3 })
  )
  const isBlockQuote = createEditorTransaction(
    () => props.editor,
    (editor) => editor && editor.isActive('blockquote')
  )
  const isLink = createEditorTransaction(
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
    if (url().length === 0) {
      props.editor.chain().focus().unsetLink().run()
      clearLinkForm()
      return
    }

    if (url().length > 1 && validateUrl(url())) {
      props.editor.commands.toggleLink({ href: url() })
      clearLinkForm()
    } else {
      setLinkError(t('Invalid url format'))
    }
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
                value={prevUrl() ? prevUrl() : null}
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
                onClick={() => setTextSizeBubbleOpen(!textSizeBubbleOpen())}
              >
                <Icon name="editor-text-size" />
                <Icon name="down-triangle" />
              </button>
              <Show when={textSizeBubbleOpen()}>
                <div class={styles.dropDown}>
                  <header>{t('Headers')}</header>
                  <div class={styles.actions}>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: isHOne()
                      })}
                      onClick={() => props.editor.commands.toggleHeading({ level: 1 })}
                    >
                      <Icon name="editor-h1" />
                    </button>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: isHTwo()
                      })}
                      onClick={() => props.editor.commands.toggleHeading({ level: 2 })}
                    >
                      <Icon name="editor-h2" />
                    </button>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: isHThree()
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
                        [styles.bubbleMenuButtonActive]: isBlockQuote()
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
                [styles.bubbleMenuButtonActive]: isBold()
              })}
              onClick={() => props.editor.commands.toggleBold()}
            >
              <Icon name="editor-bold" />
            </button>
            <button
              type="button"
              class={clsx(styles.bubbleMenuButton, {
                [styles.bubbleMenuButtonActive]: isItalic()
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
              <Icon name="editor-footnote" />
            </button>
            <div class={styles.delimiter} />
            <button type="button" class={styles.bubbleMenuButton}>
              <Icon name="editor-ul" />
            </button>
          </>
        )}
      </div>
    </>
  )
}
