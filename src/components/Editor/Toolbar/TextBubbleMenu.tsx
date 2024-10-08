import type { Editor } from '@tiptap/core'
import { clsx } from 'clsx'
import { Match, Show, Switch, createEffect, createSignal, lazy, onCleanup, onMount } from 'solid-js'
import { createEditorTransaction } from 'solid-tiptap'
import { Icon } from '~/components/_shared/Icon'
import { Popover } from '~/components/_shared/Popover'
import { useLocalize } from '~/context/localize'
import { InsertLinkForm } from './InsertLinkForm'

import styles from './TextBubbleMenu.module.scss'

const MiniEditor = lazy(() => import('../MiniEditor'))

type BubbleMenuProps = {
  editor: Editor
  isCommonMarkup: boolean
  ref: (el: HTMLDivElement) => void
  shouldShow: boolean
}

export const TextBubbleMenu = (props: BubbleMenuProps) => {
  const { t } = useLocalize()

  const isActive = (name: string, attributes?: Record<string, string | number>) =>
    createEditorTransaction(
      () => {
        console.log('isActive', name, attributes)
        return props.editor
      },
      (editor) => editor?.isActive(name, attributes)
    )

  const [textSizeBubbleOpen, setTextSizeBubbleOpen] = createSignal(false)
  const [listBubbleOpen, setListBubbleOpen] = createSignal(false)
  const [linkEditorOpen, setLinkEditorOpen] = createSignal(false)
  const [footnoteEditorOpen, setFootnoteEditorOpen] = createSignal(false)
  const [footNote, setFootNote] = createSignal<string>()

  createEffect(() => {
    if (!props.shouldShow) {
      setFootNote()
      setFootnoteEditorOpen(false)
      setLinkEditorOpen(false)
      setTextSizeBubbleOpen(false)
      setListBubbleOpen(false)
    }
  })

  const isBold = isActive('bold')
  const isItalic = isActive('italic')
  const isH1 = isActive('heading', { level: 2 })
  const isH2 = isActive('heading', { level: 3 })
  const isH3 = isActive('heading', { level: 4 })
  const isQuote = isActive('blockquote', { 'data-type': 'quote' })
  const isPunchLine = isActive('blockquote', { 'data-type': 'punchline' })
  const isOrderedList = isActive('isOrderedList')
  const isBulletList = isActive('isBulletList')
  const isLink = isActive('link')
  const isHighlight = isActive('highlight')
  const isFootnote = isActive('footnote')
  const isIncut = isActive('article')

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
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'KeyK' && (event.metaKey || event.ctrlKey) && !props.editor.state.selection.empty) {
      event.preventDefault()
      setLinkEditorOpen(true)
    }
  }

  const updateCurrentFootnoteValue = createEditorTransaction(
    () => props.editor,
    (ed) => {
      if (!isFootnote()) {
        return
      }
      const value = ed.getAttributes('footnote').value
      setFootNote(value)
    }
  )

  const handleAddFootnote = (footnote: string) => {
    if (footNote()) {
      props.editor?.chain().focus().updateFootnote({ value: footnote }).run()
    } else {
      props.editor?.chain().focus().setFootnote({ value: footnote }).run()
    }
    setFootNote()
    setLinkEditorOpen(false)
    setFootnoteEditorOpen(false)
  }

  const handleOpenFootnoteEditor = () => {
    updateCurrentFootnoteValue()
    setLinkEditorOpen(false)
    setFootnoteEditorOpen(true)
  }

  const handleSetPunchline = () => {
    if (isPunchLine()) {
      props.editor?.chain().focus().toggleBlockquote('punchline').run()
    }
    props.editor?.chain().focus().toggleBlockquote('quote').run()
    toggleTextSizePopup()
  }
  const handleSetQuote = () => {
    if (isQuote()) {
      props.editor?.chain().focus().toggleBlockquote('quote').run()
    }
    props.editor?.chain().focus().toggleBlockquote('punchline').run()
    toggleTextSizePopup()
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown)
      setLinkEditorOpen(false)
    })
  })

  const handleOpenLinkForm = () => {
    props.editor?.chain().focus().addTextWrap({ class: 'highlight-fake-selection' }).run()
    setLinkEditorOpen(true)
  }

  const handleCloseLinkForm = () => {
    setLinkEditorOpen(false)
    props.editor?.chain().focus().removeTextWrap({ class: 'highlight-fake-selection' }).run()
  }

  return (
    <div ref={props.ref} class={clsx(styles.TextBubbleMenu, { [styles.growWidth]: footnoteEditorOpen() })}>
      <Switch>
        <Match when={linkEditorOpen()}>
          <InsertLinkForm editor={props.editor} onClose={handleCloseLinkForm} />
        </Match>
        <Match when={footnoteEditorOpen()}>
          <MiniEditor
            placeholder={t('Enter footnote text')}
            onSubmit={(value: string) => handleAddFootnote(value)}
            content={footNote()}
            onCancel={() => {
              setFootnoteEditorOpen(false)
            }}
          />
        </Match>
        <Match when={!(linkEditorOpen() && footnoteEditorOpen())}>
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
                          {(triggerRef: (el: HTMLElement) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isH1()
                              })}
                              onClick={() => {
                                props.editor?.chain().focus().toggleHeading({ level: 2 }).run()
                                toggleTextSizePopup()
                              }}
                            >
                              <Icon name="editor-h1" />
                            </button>
                          )}
                        </Popover>
                        <Popover content={t('Header 2')}>
                          {(triggerRef: (el: HTMLElement) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isH2()
                              })}
                              onClick={() => {
                                props.editor?.chain().focus().toggleHeading({ level: 3 }).run()
                                toggleTextSizePopup()
                              }}
                            >
                              <Icon name="editor-h2" />
                            </button>
                          )}
                        </Popover>
                        <Popover content={t('Header 3')}>
                          {(triggerRef: (el: HTMLElement) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isH3()
                              })}
                              onClick={() => {
                                props.editor?.chain().focus().toggleHeading({ level: 4 }).run()
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
                          {(triggerRef: (el: HTMLElement) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isQuote()
                              })}
                              onClick={handleSetPunchline}
                            >
                              <Icon name="editor-blockquote" />
                            </button>
                          )}
                        </Popover>
                        <Popover content={t('Punchline')}>
                          {(triggerRef: (el: HTMLElement) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isPunchLine()
                              })}
                              onClick={handleSetQuote}
                            >
                              <Icon name="editor-quote" />
                            </button>
                          )}
                        </Popover>
                      </div>
                      <header>{t('squib')}</header>
                      <div class={styles.actions}>
                        <Popover content={t('Incut')}>
                          {(triggerRef: (el: HTMLElement) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isIncut()
                              })}
                              onClick={() => {
                                props.editor?.chain().focus().toggleArticle().run()
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
              {(triggerRef: (el: HTMLElement) => void) => (
                <button
                  ref={triggerRef}
                  type="button"
                  class={clsx(styles.bubbleMenuButton, {
                    [styles.bubbleMenuButtonActive]: isBold()
                  })}
                  onClick={() => props.editor?.chain().focus().toggleBold().run()}
                >
                  <Icon name="editor-bold" />
                </button>
              )}
            </Popover>
            <Popover content={t('Italic')}>
              {(triggerRef: (el: HTMLElement) => void) => (
                <button
                  ref={triggerRef}
                  type="button"
                  class={clsx(styles.bubbleMenuButton, {
                    [styles.bubbleMenuButtonActive]: isItalic()
                  })}
                  onClick={() => props.editor?.chain().focus().toggleItalic().run()}
                >
                  <Icon name="editor-italic" />
                </button>
              )}
            </Popover>

            <Show when={!props.isCommonMarkup}>
              <Popover content={t('Highlight')}>
                {(triggerRef: (el: HTMLElement) => void) => (
                  <button
                    ref={triggerRef}
                    type="button"
                    class={clsx(styles.bubbleMenuButton, {
                      [styles.bubbleMenuButtonActive]: isHighlight()
                    })}
                    onClick={() =>
                      props.editor?.chain().focus().toggleHighlight({ color: '#f6e3a1' }).run()
                    }
                  >
                    <div class={styles.toggleHighlight} />
                  </button>
                )}
              </Popover>
              <div class={styles.delimiter} />
            </Show>
            <Popover content={<div class={styles.noWrap}>{t('Add url')}</div>}>
              {(triggerRef: (el: HTMLElement) => void) => (
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={handleOpenLinkForm}
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
                  {(triggerRef: (el: HTMLElement) => void) => (
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
                          {(triggerRef: (el: HTMLElement) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isBulletList()
                              })}
                              onClick={() => {
                                props.editor?.chain().focus().toggleBulletList().run()
                                toggleListPopup()
                              }}
                            >
                              <Icon name="editor-ul" />
                            </button>
                          )}
                        </Popover>
                        <Popover content={t('Ordered list')}>
                          {(triggerRef: (el: HTMLElement) => void) => (
                            <button
                              ref={triggerRef}
                              type="button"
                              class={clsx(styles.bubbleMenuButton, {
                                [styles.bubbleMenuButtonActive]: isOrderedList()
                              })}
                              onClick={() => {
                                props.editor?.chain().focus().toggleOrderedList().run()
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
