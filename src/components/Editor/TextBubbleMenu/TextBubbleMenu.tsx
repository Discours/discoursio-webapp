import { Switch, Match, createSignal, Show } from 'solid-js'
import type { Editor } from '@tiptap/core'
import styles from './TextBubbleMenu.module.scss'
import { Icon } from '../../_shared/Icon'
import { clsx } from 'clsx'
import { createEditorTransaction } from 'solid-tiptap'
import { useLocalize } from '../../../context/localize'
import { InlineForm } from '../InlineForm'
import validateImage from '../../../utils/validateUrl'

type BubbleMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

export const TextBubbleMenu = (props: BubbleMenuProps) => {
  const { t } = useLocalize()
  const [textSizeBubbleOpen, setTextSizeBubbleOpen] = createSignal<boolean>(false)
  const [listBubbleOpen, setListBubbleOpen] = createSignal<boolean>(false)
  const [linkEditorOpen, setLinkEditorOpen] = createSignal<boolean>(false)

  const isActive = (name: string, attributes?: unknown) =>
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

  const toggleLinkForm = () => {
    setLinkEditorOpen(true)
  }

  const toggleTextSizePopup = () => {
    if (listBubbleOpen()) {
      setListBubbleOpen(false)
    }

    setTextSizeBubbleOpen((prev) => !prev)
  }
  const toggleListPopup = () => {
    if (textSizeBubbleOpen()) {
      setTextSizeBubbleOpen(false)
    }

    setListBubbleOpen((prev) => !prev)
  }

  const handleLinkFormSubmit = (value: string) => {
    props.editor.chain().focus().setLink({ href: value }).run()
  }

  const currentUrl = createEditorTransaction(
    () => props.editor,
    (editor) => {
      return (editor && editor.getAttributes('link').href) || ''
    }
  )

  const handleClearLinkForm = () => {
    if (currentUrl()) {
      props.editor.chain().focus().unsetLink().run()
    }
    setLinkEditorOpen(false)
  }

  return (
    <div ref={props.ref} class={styles.bubbleMenu}>
      <Switch>
        <Match when={linkEditorOpen()}>
          <InlineForm
            placeholder={t('Enter URL address')}
            initialValue={currentUrl() ?? ''}
            onClear={handleClearLinkForm}
            validate={(value) => (validateImage(value) ? '' : t('Invalid url format'))}
            onSubmit={handleLinkFormSubmit}
            onClose={() => setLinkEditorOpen(false)}
            errorMessage={t('Error')}
          />
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
                      onClick={() => {
                        props.editor.chain().focus().toggleHeading({ level: 1 }).run()
                        toggleTextSizePopup()
                      }}
                    >
                      <Icon name="editor-h1" />
                    </button>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: isH2()
                      })}
                      onClick={() => {
                        props.editor.chain().focus().toggleHeading({ level: 2 }).run()
                        toggleTextSizePopup()
                      }}
                    >
                      <Icon name="editor-h2" />
                    </button>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: isH3()
                      })}
                      onClick={() => {
                        props.editor.chain().focus().toggleHeading({ level: 3 }).run()
                        toggleTextSizePopup()
                      }}
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
                      onClick={() => {
                        props.editor.chain().focus().toggleBlockquote().run()
                        toggleTextSizePopup()
                      }}
                    >
                      <Icon name="editor-blockquote" />
                    </button>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: isBlockQuote()
                      })}
                      onClick={() => {
                        props.editor.chain().focus().toggleBlockquote().run()
                        toggleTextSizePopup()
                      }}
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
                      onClick={() => {
                        props.editor.chain().focus().toggleBulletList().run()
                        toggleListPopup()
                      }}
                    >
                      <Icon name="editor-ul" />
                    </button>
                    <button
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: isOrderedList()
                      })}
                      onClick={() => {
                        props.editor.chain().focus().toggleOrderedList().run()
                        toggleListPopup()
                      }}
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
  )
}
