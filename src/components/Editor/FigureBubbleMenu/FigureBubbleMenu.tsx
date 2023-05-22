import { Show } from 'solid-js'
import type { Editor } from '@tiptap/core'
import styles from './FigureBubbleMenu.module.scss'
import { clsx } from 'clsx'
import { Icon } from '../../_shared/Icon'

type Props = {
  editor: Editor
  ref: (el: HTMLElement) => void
  focusedRef?: 'image' | 'blockquote' | 'incut'
}

export const FigureBubbleMenu = (props: Props) => {
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
          <span style={{ color: 'white' }}>Добавить подпись</span>
        </button>
        <div class={styles.delimiter} />
        <button type="button" class={clsx(styles.bubbleMenuButton)}>
          <Icon name="editor-image-add" />
        </button>
      </Show>
    </div>
  )
}
