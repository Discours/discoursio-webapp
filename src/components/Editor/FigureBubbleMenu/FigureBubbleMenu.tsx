import { createSignal, Show, For } from 'solid-js'
import type { Editor } from '@tiptap/core'
import styles from './FigureBubbleMenu.module.scss'
import { clsx } from 'clsx'
import { Icon } from '../../_shared/Icon'
import { useLocalize } from '../../../context/localize'

type Props = {
  editor: Editor
  ref: (el: HTMLElement) => void
  focusedRef?: 'image' | 'blockquote' | 'incut'
}

const backgrounds = [null, 'black', 'yellow', 'pink', 'green']

export const FigureBubbleMenu = (props: Props) => {
  const { t } = useLocalize()
  const [substratBubbleOpen, setSubstratBubbleOpen] = createSignal(false)
  return (
    <div ref={props.ref} class={styles.FigureBubbleMenu}>
      <button
        type="button"
        class={clsx(styles.bubbleMenuButton)}
        onClick={() => {
          if (props.focusedRef === 'image') {
            props.editor.chain().focus().setImageFloat('left').run()
          } else if (props.focusedRef === 'blockquote') {
            props.editor.chain().focus().setBlockQuoteFloat('left').run()
          } else {
            props.editor.chain().focus().setArticleFloat('left').run()
          }
        }}
      >
        <Icon name="editor-image-align-left" />
      </button>
      <Show when={props.focusedRef === 'incut'}>
        <button
          type="button"
          class={clsx(styles.bubbleMenuButton)}
          onClick={() => props.editor.chain().focus().setArticleFloat('half-left').run()}
        >
          <Icon name="editor-image-half-align-left" />
        </button>
      </Show>
      <button
        type="button"
        class={clsx(styles.bubbleMenuButton)}
        onClick={() => {
          if (props.focusedRef === 'image') {
            props.editor.chain().focus().setImageFloat(null).run()
          } else if (props.focusedRef === 'blockquote') {
            props.editor.chain().focus().setBlockQuoteFloat(null).run()
          } else {
            props.editor.chain().focus().setArticleFloat(null).run()
          }
        }}
      >
        <Icon name="editor-image-align-center" />
      </button>
      <Show when={props.focusedRef === 'incut'}>
        <button
          type="button"
          class={clsx(styles.bubbleMenuButton)}
          onClick={() => props.editor.chain().focus().setArticleFloat('half-right').run()}
        >
          <Icon name="editor-image-half-align-right" />
        </button>
      </Show>
      <button
        type="button"
        class={clsx(styles.bubbleMenuButton)}
        onClick={() => {
          if (props.focusedRef === 'image') {
            props.editor.chain().focus().setImageFloat('right').run()
          } else if (props.focusedRef === 'blockquote') {
            props.editor.chain().focus().setBlockQuoteFloat('right').run()
          } else {
            props.editor.chain().focus().setArticleFloat('right').run()
          }
        }}
      >
        <Icon name="editor-image-align-right" />
      </button>
      <Show when={props.focusedRef === 'image'}>
        <div class={styles.delimiter} />
        <button
          type="button"
          class={clsx(styles.bubbleMenuButton)}
          onClick={() => {
            props.editor.chain().focus().imageToFigure().run()
          }}
        >
          <span style={{ color: 'white' }}>{t('Add signature')}</span>
        </button>
        <div class={styles.delimiter} />
        <button type="button" class={clsx(styles.bubbleMenuButton)}>
          <Icon name="editor-image-add" />
        </button>
      </Show>
      <Show when={props.focusedRef === 'incut'}>
        <div class={styles.delimiter} />
        <div class={styles.dropDownHolder}>
          <button
            type="button"
            class={clsx(styles.bubbleMenuButton)}
            onClick={() => setSubstratBubbleOpen(!substratBubbleOpen())}
          >
            <span style={{ color: 'white' }}>{t('Substrate')}</span>
            <Icon name="down-triangle" class={styles.triangle} />
          </button>
          <Show when={!substratBubbleOpen()}>
            <div class={styles.dropDown}>
              <div class={styles.actions}>
                <For each={backgrounds}>
                  {(bg) => (
                    <div
                      onClick={() => props.editor.chain().focus().setArticleBg(bg).run()}
                      class={clsx(styles.color, styles[bg])}
                    />
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}
