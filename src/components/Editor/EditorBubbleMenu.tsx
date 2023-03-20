import type { Editor } from '@tiptap/core'
import styles from './EditorBubbleMenu.module.scss'
import { Icon } from '../_shared/Icon'
import { clsx } from 'clsx'
import { createEditorTransaction } from 'solid-tiptap'
import { createSignal } from 'solid-js'
import { useLocalize } from '../../context/localize'
import validateUrl from '../../utils/validateUrl'

type BubbleMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

export const EditorBubbleMenu = (props: BubbleMenuProps) => {
  const { t } = useLocalize()
  const [linkEditorOpen, setLinkEditorOpen] = createSignal<boolean>(false)
  const [url, setUrl] = createSignal<string>('')
  const [prevUrl, setPrevUrl] = createSignal<string | null>(null)
  const [linkError, setLinkError] = createSignal<string | null>(null)

  const isBold = createEditorTransaction(
    () => props.editor,
    (editor) => editor && editor.isActive('bold')
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
              <button role="button" onClick={() => clearLinkForm()}>
                <Icon name="status-cancel" />
              </button>
            </form>
            {linkError() && <div class={styles.linkError}>{linkError()}</div>}
          </>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.preventDefault()
                setLinkEditorOpen(true)
              }}
              class={clsx(styles.bubbleMenuButton, {
                [styles.bubbleMenuButtonActive]: isLink()
              })}
            >
              <Icon name="editor-link" />
            </button>
            <button class={clsx(styles.bubbleMenuButton)}>
              <Icon name="editor-text-size" />
            </button>
            <button
              class={clsx(styles.bubbleMenuButton, {
                [styles.bubbleMenuButtonActive]: isBold()
              })}
              onClick={(e) => {
                e.preventDefault()
                props.editor.commands.toggleBold()
              }}
            >
              <Icon name="editor-bold" />
            </button>
            <button class={styles.bubbleMenuButton}>
              <Icon name="editor-italic" />
            </button>
            <div class={styles.delimiter}>D</div>
            <button class={styles.bubbleMenuButton}>
              <Icon name="editor-link" />
            </button>
            <button class={styles.bubbleMenuButton}>
              <Icon name="editor-footnote" />
            </button>
            <div class={styles.delimiter} />
            <button class={styles.bubbleMenuButton}>
              <Icon name="editor-ul" />
            </button>
          </>
        )}
      </div>
    </>
  )
}
