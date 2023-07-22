import { Switch, Match, createSignal, Show } from 'solid-js'
import type { Editor } from '@tiptap/core'
import styles from './TextBubbleMenu.module.scss'
import { Icon } from '../../_shared/Icon'
import { clsx } from 'clsx'
import { createEditorTransaction } from 'solid-tiptap'
import { useLocalize } from '../../../context/localize'
import { InlineForm } from '../InlineForm'
import { validateUrl } from '../../../utils/validateUrl'
import { Popover } from '../../_shared/Popover'
import { checkUrl } from '../utils/checkUrl'
// import { isActive } from '../utils/isActive'

type BubbleMenuProps = {
  editor: Editor
  isCommonMarkup: boolean
  ref: (el: HTMLDivElement) => void
}

export const TextBubbleMenu = (props: BubbleMenuProps) => {
  const { t } = useLocalize()

  const isActive = (name: string, attributes?: unknown) =>
    createEditorTransaction(
      () => props.editor,
      (editor) => {
        return editor && editor.isActive(name, attributes)
      }
    )
  const [textSizeBubbleOpen, setTextSizeBubbleOpen] = createSignal(false)
  const [listBubbleOpen, setListBubbleOpen] = createSignal(false)
  const [linkEditorOpen, setLinkEditorOpen] = createSignal(false)

  const isBold = isActive('bold')
  const isItalic = isActive('italic')
  const isH1 = isActive('heading', { level: 2 })
  const isH2 = isActive('heading', { level: 3 })
  const isH3 = isActive('heading', { level: 4 })
  const isBlockQuote = isActive('blockquote')
  const isOrderedList = isActive('isOrderedList')
  const isBulletList = isActive('isBulletList')
  const isLink = isActive('link')
  const isHighlight = isActive('highlight')

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
    props.editor
      .chain()
      .focus()
      .setLink({ href: checkUrl(value) })
      .run()
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
    <div ref={props.ref} class={styles.TextBubbleMenu}>
      <Switch>
        <Match when={linkEditorOpen()}>
          <InlineForm
            placeholder={t('Enter URL address')}
            initialValue={currentUrl() ?? ''}
            onClear={handleClearLinkForm}
            validate={(value) => (validateUrl(value) ? '' : t('Invalid url format'))}
            onSubmit={handleLinkFormSubmit}
            onClose={() => setLinkEditorOpen(false)}
          />
        </Match>
        <Match when={!linkEditorOpen()}>
          <>
            <Show when={!props.isCommonMarkup}>
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
                        <Popover content={t('Header 1')}>
                          {(triggerRef: (el) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isH1()
                              })}
                              onClick={() => {
                                props.editor.chain().focus().toggleHeading({ level: 2 }).run()
                                toggleTextSizePopup()
                              }}
                            >
                              <Icon name="editor-h1" />
                            </button>
                          )}
                        </Popover>
                        <Popover content={t('Header 2')}>
                          {(triggerRef: (el) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isH2()
                              })}
                              onClick={() => {
                                props.editor.chain().focus().toggleHeading({ level: 3 }).run()
                                toggleTextSizePopup()
                              }}
                            >
                              <Icon name="editor-h2" />
                            </button>
                          )}
                        </Popover>
                        <Popover content={t('Header 3')}>
                          {(triggerRef: (el) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isH3()
                              })}
                              onClick={() => {
                                props.editor.chain().focus().toggleHeading({ level: 4 }).run()
                                toggleTextSizePopup()
                              }}
                            >
                              <Icon name="editor-h3" />
                            </button>
                          )}
                        </Popover>
                      </div>
                      <header>{t('Quotes')}</header>
                      <div class={styles.actions}>
                        <Popover content={t('Quote')}>
                          {(triggerRef: (el) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isBlockQuote()
                              })}
                              onClick={() => {
                                props.editor.chain().focus().toggleBlockquote('quote').run()
                                toggleTextSizePopup()
                              }}
                            >
                              <Icon name="editor-blockquote" />
                            </button>
                          )}
                        </Popover>
                        <Popover content={t('Punchline')}>
                          {(triggerRef: (el) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isBlockQuote()
                              })}
                              onClick={() => {
                                props.editor.chain().focus().toggleBlockquote('punchline').run()
                                toggleTextSizePopup()
                              }}
                            >
                              <Icon name="editor-quote" />
                            </button>
                          )}
                        </Popover>
                      </div>
                      <header>{t('squib')}</header>
                      <div class={styles.actions}>
                        <Popover content={t('Incut')}>
                          {(triggerRef: (el) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isBlockQuote()
                              })}
                              onClick={() => {
                                props.editor.chain().focus().toggleArticle().run()
                                toggleTextSizePopup()
                              }}
                            >
                              <Icon name="editor-squib" />
                            </button>
                          )}
                        </Popover>
                      </div>
                    </div>
                  </Show>
                </div>
                <div class={styles.delimiter} />
              </>
            </Show>
            <Popover content={t('Bold')}>
              {(triggerRef: (el) => void) => (
                <button
                  ref={triggerRef}
                  type="button"
                  class={clsx(styles.bubbleMenuButton, {
                    [styles.bubbleMenuButtonActive]: isBold()
                  })}
                  onClick={() => props.editor.chain().focus().toggleBold().run()}
                >
                  <Icon name="editor-bold" />
                </button>
              )}
            </Popover>
            <Popover content={t('Italic')}>
              {(triggerRef: (el) => void) => (
                <button
                  ref={triggerRef}
                  type="button"
                  class={clsx(styles.bubbleMenuButton, {
                    [styles.bubbleMenuButtonActive]: isItalic()
                  })}
                  onClick={() => props.editor.chain().focus().toggleItalic().run()}
                >
                  <Icon name="editor-italic" />
                </button>
              )}
            </Popover>

            <Show when={!props.isCommonMarkup}>
              <Popover content={t('Highlight')}>
                {(triggerRef: (el) => void) => (
                  <button
                    ref={triggerRef}
                    type="button"
                    class={clsx(styles.bubbleMenuButton, {
                      [styles.bubbleMenuButtonActive]: isHighlight()
                    })}
                    onClick={() => props.editor.chain().focus().toggleHighlight({ color: '#f6e3a1' }).run()}
                  >
                    <div class={styles.toggleHighlight} />
                  </button>
                )}
              </Popover>
            </Show>
            <div class={styles.delimiter} />
            <Popover content={t('Add url')}>
              {(triggerRef: (el) => void) => (
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => setLinkEditorOpen(true)}
                  class={clsx(styles.bubbleMenuButton, {
                    [styles.bubbleMenuButtonActive]: isLink()
                  })}
                >
                  <Icon name="editor-link" />
                </button>
              )}
            </Popover>
            <Show when={!props.isCommonMarkup}>
              <>
                <Popover content={t('Insert footnote')}>
                  {(triggerRef: (el) => void) => (
                    <button ref={triggerRef} type="button" class={styles.bubbleMenuButton}>
                      <Icon name="editor-footnote" />
                    </button>
                  )}
                </Popover>
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
                        <Popover content={t('Bullet list')}>
                          {(triggerRef: (el) => void) => (
                            <button
                              ref={triggerRef}
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
                          )}
                        </Popover>
                        <Popover content={t('Ordered list')}>
                          {(triggerRef: (el) => void) => (
                            <button
                              ref={triggerRef}
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
                          )}
                        </Popover>
                      </div>
                    </div>
                  </Show>
                </div>
              </>
            </Show>
          </>
        </Match>
      </Switch>
    </div>
  )
}
