import type { Editor } from '@tiptap/core'
import { clsx } from 'clsx'
import {
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  lazy,
  onCleanup,
  onMount
} from 'solid-js'
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

  const isActive = createMemo(
    () => (name: string, attributes?: Record<string, string | number>) =>
      props.editor?.isActive(name, attributes)
  )

  const [menuState, setMenuState] = createSignal({
    textSizeBubbleOpen: false,
    listBubbleOpen: false,
    linkEditorOpen: false,
    footnoteEditorOpen: false,
    footNote: undefined as string | undefined
  })

  createEffect(() => {
    if (!props.shouldShow) {
      setMenuState((prev) => ({
        ...prev,
        footNote: undefined,
        footnoteEditorOpen: false,
        linkEditorOpen: false,
        textSizeBubbleOpen: false,
        listBubbleOpen: false
      }))
    }
  })

  const activeStates = createMemo(() => ({
    bold: isActive()('bold'),
    italic: isActive()('italic'),
    h1: isActive()('heading', { level: 2 }),
    h2: isActive()('heading', { level: 3 }),
    h3: isActive()('heading', { level: 4 }),
    quote: isActive()('blockquote', { 'data-type': 'quote' }),
    punchLine: isActive()('blockquote', { 'data-type': 'punchline' }),
    orderedList: isActive()('orderedList'),
    bulletList: isActive()('bulletList'),
    link: isActive()('link'),
    highlight: isActive()('highlight'),
    footnote: isActive()('footnote'),
    incut: isActive()('article')
    // underline: isActive()('underline'),
  }))

  const togglePopup = (type: 'textSize' | 'list') => {
    setMenuState((prev) => ({
      ...prev,
      textSizeBubbleOpen: type === 'textSize' ? !prev.textSizeBubbleOpen : false,
      listBubbleOpen: type === 'list' ? !prev.listBubbleOpen : false
    }))
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'KeyK' && (event.metaKey || event.ctrlKey) && !props.editor.state.selection.empty) {
      event.preventDefault()
      setMenuState((prev) => ({ ...prev, linkEditorOpen: true }))
    }
  }

  const updateCurrentFootnoteValue = createEditorTransaction(
    () => props.editor,
    (ed) => {
      if (!activeStates().footnote) {
        return
      }
      const value = ed.getAttributes('footnote').value
      setMenuState((prev) => ({ ...prev, footNote: value }))
    }
  )

  const handleAddFootnote = (footnote: string) => {
    if (menuState().footNote) {
      props.editor?.chain().focus().updateFootnote({ value: footnote }).run()
    } else {
      props.editor?.chain().focus().setFootnote({ value: footnote }).run()
    }
    setMenuState((prev) => ({
      ...prev,
      footNote: undefined,
      linkEditorOpen: false,
      footnoteEditorOpen: false
    }))
  }

  const handleOpenFootnoteEditor = () => {
    updateCurrentFootnoteValue()
    setMenuState((prev) => ({ ...prev, linkEditorOpen: false, footnoteEditorOpen: true }))
  }

  const handleSetPunchline = () => {
    if (activeStates().punchLine) {
      props.editor?.chain().focus().toggleBlockquote('punchline').run()
    }
    props.editor?.chain().focus().toggleBlockquote('quote').run()
    togglePopup('textSize')
  }
  const handleSetQuote = () => {
    if (activeStates().quote) {
      props.editor?.chain().focus().toggleBlockquote('quote').run()
    }
    props.editor?.chain().focus().toggleBlockquote('punchline').run()
    togglePopup('textSize')
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown)
      setMenuState((prev) => ({ ...prev, linkEditorOpen: false }))
    })
  })

  const handleOpenLinkForm = () => {
    props.editor?.chain().focus().addTextWrap({ class: 'highlight-fake-selection' }).run()
    setMenuState((prev) => ({ ...prev, linkEditorOpen: true }))
  }

  const handleCloseLinkForm = () => {
    setMenuState((prev) => ({ ...prev, linkEditorOpen: false }))
    props.editor?.chain().focus().removeTextWrap({ class: 'highlight-fake-selection' }).run()
  }
  const handleFormat = (type: 'Bold' | 'Italic' | 'Underline', _attributes?: Record<string, unknown>) => {
    props.editor?.chain().focus()[`toggle${type}`]().run()
  }

  const ListBubbleMenu = (props: BubbleMenuProps) => {
    return (
      <div class={styles.dropDown}>
        <header>{t('Lists')}</header>
        <div class={styles.actions}>
          <Popover content={t('Bullet list')}>
            {(triggerRef: (el: HTMLElement) => void) => (
              <button
                ref={triggerRef}
                type="button"
                class={clsx(styles.bubbleMenuButton, {
                  [styles.bubbleMenuButtonActive]: activeStates().bulletList
                })}
                onClick={() => {
                  props.editor?.chain().focus().toggleBulletList().run()
                  togglePopup('list')
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
                  [styles.bubbleMenuButtonActive]: activeStates().orderedList
                })}
                onClick={() => {
                  props.editor?.chain().focus().toggleOrderedList().run()
                  togglePopup('list')
                }}
              >
                <Icon name="editor-ol" />
              </button>
            )}
          </Popover>
        </div>
      </div>
    )
  }

  const CommonMarkupBubbleMenu = (props: BubbleMenuProps) => {
    return (
      <>
        <Popover content={t('Insert footnote')}>
          {(triggerRef: (el: HTMLElement) => void) => (
            <button
              ref={triggerRef}
              type="button"
              class={clsx(styles.bubbleMenuButton, {
                [styles.bubbleMenuButtonActive]: activeStates().footnote
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
              [styles.bubbleMenuButtonActive]: menuState().listBubbleOpen
            })}
            onClick={() => togglePopup('list')}
          >
            <Icon name="editor-ul" />
            <Icon name="down-triangle" class={styles.triangle} />
          </button>
          <Show when={menuState().listBubbleOpen}>
            <ListBubbleMenu {...props} />
          </Show>
        </div>
      </>
    )
  }

  const TextSizeBubbleMenu = (props: BubbleMenuProps) => {
    return (
      <div class={styles.dropDown}>
        <header>{t('Headers')}</header>
        <div class={styles.actions}>
          <Popover content={t('Header 1')}>
            {(triggerRef: (el: HTMLElement) => void) => (
              <button
                ref={triggerRef}
                type="button"
                class={clsx(styles.bubbleMenuButton, {
                  [styles.bubbleMenuButtonActive]: activeStates().h1
                })}
                onClick={() => {
                  props.editor?.chain().focus().toggleHeading({ level: 2 }).run()
                  togglePopup('textSize')
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
                  [styles.bubbleMenuButtonActive]: activeStates().h2
                })}
                onClick={() => {
                  props.editor?.chain().focus().toggleHeading({ level: 3 }).run()
                  togglePopup('textSize')
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
                  [styles.bubbleMenuButtonActive]: activeStates().h3
                })}
                onClick={() => {
                  props.editor?.chain().focus().toggleHeading({ level: 4 }).run()
                  togglePopup('textSize')
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
                  [styles.bubbleMenuButtonActive]: activeStates().quote
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
                  [styles.bubbleMenuButtonActive]: activeStates().punchLine
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
                  [styles.bubbleMenuButtonActive]: activeStates().incut
                })}
                onClick={() => {
                  props.editor?.chain().focus().toggleArticle().run()
                  togglePopup('textSize')
                }}
              >
                <Icon name="editor-squib" />
              </button>
            )}
          </Popover>
        </div>
      </div>
    )
  }

  const BaseTextBubbleMenu = (props: BubbleMenuProps) => {
    return (
      <>
        <Show when={!props.isCommonMarkup}>
          <>
            <div class={styles.dropDownHolder}>
              <button
                type="button"
                class={clsx(styles.bubbleMenuButton, {
                  [styles.bubbleMenuButtonActive]: menuState().textSizeBubbleOpen
                })}
                onClick={() => togglePopup('textSize')}
              >
                <Icon name="editor-text-size" />
                <Icon name="down-triangle" class={styles.triangle} />
              </button>
              <Show when={menuState().textSizeBubbleOpen}>
                <TextSizeBubbleMenu {...props} />
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
                [styles.bubbleMenuButtonActive]: activeStates().bold
              })}
              onClick={() => handleFormat('Bold')}
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
                [styles.bubbleMenuButtonActive]: activeStates().italic
              })}
              onClick={() => handleFormat('Italic')}
            >
              <Icon name="editor-italic" />
            </button>
          )}
        </Popover>
        {/*<Popover content={t('Underline')}>
        {(triggerRef: (el: HTMLElement) => void) => (
          <button
            ref={triggerRef}
            type="button"
            class={clsx(styles.bubbleMenuButton, {
              [styles.bubbleMenuButtonActive]: activeStates().underline
            })}
            onClick={() => handleFormat('Underline')}
          >
            <Icon name="editor-underline" />
          </button>
        )}
      </Popover> */}
        <Show when={!props.isCommonMarkup}>
          <Popover content={t('Highlight')}>
            {(triggerRef: (el: HTMLElement) => void) => (
              <button
                ref={triggerRef}
                type="button"
                class={clsx(styles.bubbleMenuButton, {
                  [styles.bubbleMenuButtonActive]: activeStates().highlight
                })}
                onClick={() => props.editor?.chain().focus().toggleHighlight({ color: '#f6e3a1' }).run()}
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
                [styles.bubbleMenuButtonActive]: activeStates().link
              })}
            >
              <Icon name="editor-link" />
            </button>
          )}
        </Popover>
        <Show when={!props.isCommonMarkup}>
          <CommonMarkupBubbleMenu {...props} />
        </Show>
      </>
    )
  }

  return (
    <div
      ref={props.ref}
      class={clsx(styles.TextBubbleMenu, { [styles.growWidth]: menuState().footnoteEditorOpen })}
    >
      <Switch>
        <Match when={menuState().linkEditorOpen}>
          <InsertLinkForm editor={props.editor} onClose={handleCloseLinkForm} />
        </Match>
        <Match when={menuState().footnoteEditorOpen}>
          <MiniEditor
            placeholder={t('Enter footnote text')}
            onSubmit={handleAddFootnote}
            content={menuState().footNote}
            onCancel={() => setMenuState((prev) => ({ ...prev, footnoteEditorOpen: false }))}
          />
        </Match>
        <Match when={!(menuState().linkEditorOpen || menuState().footnoteEditorOpen)}>
          <BaseTextBubbleMenu {...props} />
        </Match>
      </Switch>
    </div>
  )
}
