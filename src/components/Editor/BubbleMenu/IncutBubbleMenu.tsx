import { createSignal, Show, For } from 'solid-js'
import type { Editor } from '@tiptap/core'
import styles from './BubbleMenu.module.scss'
import { clsx } from 'clsx'
import { Icon } from '../../_shared/Icon'
import { useLocalize } from '../../../context/localize'

type Props = {
  editor: Editor
  ref: (el: HTMLElement) => void
}

const backgrounds = [null, 'white', 'black', 'yellow', 'pink', 'green']

export const IncutBubbleMenu = (props: Props) => {
  const { t } = useLocalize()
  const [substratBubbleOpen, setSubstratBubbleOpen] = createSignal(false)
  return (
    <div ref={props.ref} class={styles.BubbleMenu}>
      <button
        type="button"
        class={styles.bubbleMenuButton}
        onClick={() => props.editor.chain().focus().setArticleFloat('left').run()}
      >
        <Icon name="editor-image-align-left" />
      </button>
      <button
        type="button"
        class={styles.bubbleMenuButton}
        onClick={() => props.editor.chain().focus().setArticleFloat('half-left').run()}
      >
        <Icon name="editor-image-half-align-left" />
      </button>
      <button
        type="button"
        class={styles.bubbleMenuButton}
        onClick={() => props.editor.chain().focus().setArticleFloat(null).run()}
      >
        <Icon name="editor-image-align-center" />
      </button>

      <button
        type="button"
        class={styles.bubbleMenuButton}
        onClick={() => props.editor.chain().focus().setArticleFloat('half-right').run()}
      >
        <Icon name="editor-image-half-align-right" />
      </button>

      <button
        type="button"
        class={styles.bubbleMenuButton}
        onClick={() => props.editor.chain().focus().setArticleFloat('right').run()}
      >
        <Icon name="editor-image-align-right" />
      </button>

      <div class={styles.delimiter} />
      <div class={styles.dropDownHolder}>
        <button
          type="button"
          class={styles.bubbleMenuButton}
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
    </div>
  )
}
