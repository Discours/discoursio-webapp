import { Switch, Match, createSignal, Show } from 'solid-js'
import type { Editor } from '@tiptap/core'
import styles from './EditorBubbleMenu.module.scss'
import { Icon } from '../../_shared/Icon'
import { clsx } from 'clsx'
import { createEditorTransaction } from 'solid-tiptap'
import { useLocalize } from '../../../context/localize'
import { LinkForm } from './LinkForm'
import validateUrl from '../../../utils/validateUrl'

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
  const [linkError, setLinkError] = createSignal<string | null>(null)

  const isActive = (name: string, attributes?: {}) =>
    createEditorTransaction(
      () => props.editor,
      (editor) => {
        return editor && editor.isActive(name, attributes)
      }
    )

  const isBold = isActive('bold')
  const isItalic = isActive('italic')
  const isH1 = isActive('heading', { level: 1 })
  const isH2 = isActive('heading', { level: 2 })
  const isH3 = isActive('heading', { level: 3 })
  const isBlockQuote = isActive('blockquote')
  const isOrderedList = isActive('isOrderedList')
  const isBulletList = isActive('isBulletList')
  const isLink = isActive('link')

  //TODO: вынести логику линки в отдельный компонент
  const toggleLinkForm = () => {
    setLinkError(null)
    setLinkEditorOpen(true)
  }

  const currentUrl = createEditorTransaction(
    () => props.editor,
    (editor) => {
      return (editor && editor.getAttributes('link').href) || ''
    }
  )

  const clearLinkForm = () => {
    if (currentUrl()) {
      props.editor.chain().focus().unsetLink().run()
    }
    setUrl('')
    setLinkEditorOpen(false)
  }
  const handleUrlChange = (value) => {
    setUrl(value)
  }
  const handleSubmitLink = () => {
    if (validateUrl(url())) {
      props.editor.chain().focus().setLink({ href: url() }).run()
      setLinkEditorOpen(false)
    } else {
      setLinkError(t('Invalid url format'))
    }
  }

  const handleKeyPress = (event) => {
    const key = event.key
    if (key === 'Enter') handleSubmitLink()
    if (key === 'Esc') clearLinkForm()
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
        <Switch>
          <Match when={linkEditorOpen()}>
            <>
              {/*<LinkForm editor={props.editor} editorOpen={linkEditorOpen()} />*/}
              <div class={styles.linkForm}>
                <input
                  type="text"
                  placeholder={t('Enter URL address')}
                  autofocus
                  value={currentUrl()}
                  onKeyPress={(e) => handleKeyPress(e)}
                  onChange={(e) => handleUrlChange(e.currentTarget.value)}
                />
                <button type="button" onClick={() => handleSubmitLink()} disabled={linkError() !== null}>
                  <Icon name="status-done" />
                </button>
                <button type="button" onClick={() => clearLinkForm()}>
                  {currentUrl() ? 'Ж' : <Icon name="status-cancel" />}
                </button>
              </div>
              {linkError() && <div class={styles.linkError}>{linkError()}</div>}
            </>
          </Match>
          <Match when={!linkEditorOpen()}>
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
                          [styles.bubbleMenuButtonActive]: isH1()
                        })}
                        onClick={() => props.editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      >
                        <Icon name="editor-h1" />
                      </button>
                      <button
                        type="button"
                        class={clsx(styles.bubbleMenuButton, {
                          [styles.bubbleMenuButtonActive]: isH2()
                        })}
                        onClick={() => props.editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      >
                        <Icon name="editor-h2" />
                      </button>
                      <button
                        type="button"
                        class={clsx(styles.bubbleMenuButton, {
                          [styles.bubbleMenuButtonActive]: isH3()
                        })}
                        onClick={() => props.editor.chain().focus().toggleHeading({ level: 3 }).run()}
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
                      <button
                        type="button"
                        class={clsx(styles.bubbleMenuButton, {
                          [styles.bubbleMenuButtonActive]: isBlockQuote()
                        })}
                        onClick={() => props.editor.chain().focus().toggleBlockquote().run()}
                      >
                        <Icon name="editor-quote" />
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
                onClick={() => props.editor.chain().focus().toggleBold().run()}
              >
                <Icon name="editor-bold" />
              </button>
              <button
                type="button"
                class={clsx(styles.bubbleMenuButton, {
                  [styles.bubbleMenuButtonActive]: isItalic()
                })}
                onClick={() => props.editor.chain().focus().toggleItalic().run()}
              >
                <Icon name="editor-italic" />
              </button>
              <div class={styles.delimiter} />
              <button
                type="button"
                onClick={toggleLinkForm}
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
              <div class={styles.dropDownHolder}>
                <button
                  type="button"
                  class={clsx(styles.bubbleMenuButton, {
                    [styles.bubbleMenuButtonActive]: listBubbleOpen()
                  })}
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
                          [styles.bubbleMenuButtonActive]: isBulletList()
                        })}
                        onClick={() => props.editor.chain().focus().toggleBulletList().run()}
                      >
                        <Icon name="editor-ul" />
                      </button>
                      <button
                        type="button"
                        class={clsx(styles.bubbleMenuButton, {
                          [styles.bubbleMenuButtonActive]: isOrderedList()
                        })}
                        onClick={() => props.editor.chain().focus().toggleOrderedList().run()}
                      >
                        <Icon name="editor-ol" />
                      </button>
                    </div>
                  </div>
                </Show>
              </div>
            </>
          </Match>
        </Switch>
      </div>
    </>
  )
}
