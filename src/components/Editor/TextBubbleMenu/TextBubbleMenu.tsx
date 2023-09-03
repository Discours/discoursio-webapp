import { Switch, Match, createSignal, Show, onMount, onCleanup } from 'solid-js'
import type { Editor } from '@tiptap/core'
import styles from './TextBubbleMenu.module.scss'
import { Icon } from '../../_shared/Icon'
import { clsx } from 'clsx'
import { createEditorTransaction } from 'solid-tiptap'
import { useLocalize } from '../../../context/localize'
import { Popover } from '../../_shared/Popover'
import { InsertLinkForm } from '../InsertLinkForm'
import SimplifiedEditor from '../SimplifiedEditor'
import { Button } from '../../_shared/Button'
import { showModal } from '../../../stores/ui'

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
  const [footnoteEditorOpen, setFootnoteEditorOpen] = createSignal(false)
  const [footNote, setFootNote] = createSignal<string>()

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
  const isFootnote = isActive('footnote')

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
  const handleKeyDown = async (event) => {
    if (event.code === 'KeyK' && (event.metaKey || event.ctrlKey) && !props.editor.state.selection.empty) {
      event.preventDefault()
      setLinkEditorOpen(true)
    }
  }

  const currentFootnoteValue = createEditorTransaction(
    () => props.editor,
    (ed) => {
      return (ed && ed.getAttributes('footnote').value) || ''
    }
  )

  const handleAddFootnote = (footnote) => {
    if (footNote()) {
      props.editor.chain().focus().updateFootnote(footnote).run()
    } else {
      props.editor.chain().focus().setFootnote({ value: footnote }).run()
    }
    setFootNote()
    setFootnoteEditorOpen(false)
  }

  const handleOpenFootnoteEditor = () => {
    setFootNote(currentFootnoteValue())
    setFootnoteEditorOpen(true)
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div ref={props.ref} class={clsx(styles.TextBubbleMenu, { [styles.growWidth]: footnoteEditorOpen() })}>
      <Switch>
        <Match when={linkEditorOpen()}>
          <InsertLinkForm editor={props.editor} onClose={() => setLinkEditorOpen(false)} />
        </Match>
        <Match when={footnoteEditorOpen()}>
          <SimplifiedEditor
            imageEnabled={true}
            placeholder={t('Enter footnote text')}
            onSubmit={(value) => handleAddFootnote(value)}
            variant={'bordered'}
            initialContent={currentFootnoteValue().value ?? null}
            onCancel={() => {
              setFootnoteEditorOpen(false)
            }}
            submitButtonText={t('Send')}
          />
        </Match>
        <Match when={!linkEditorOpen() || !footnoteEditorOpen()}>
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
              <div class={styles.delimiter} />
            </Show>
            <Popover content={<div class={styles.noWrap}>{t('Add url')}</div>}>
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
                    <button
                      ref={triggerRef}
                      type="button"
                      class={clsx(styles.bubbleMenuButton, {
                        [styles.bubbleMenuButtonActive]: isFootnote()
                      })}
                      onClick={handleOpenFootnoteEditor}
                    >
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
