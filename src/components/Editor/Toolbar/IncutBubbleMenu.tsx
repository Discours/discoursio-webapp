import type { Editor } from '@tiptap/core'

import { clsx } from 'clsx'
import { For, Show, createSignal } from 'solid-js'

import { Icon } from '~/components/_shared/Icon'
import { useLocalize } from '~/context/localize'

import styles from './BubbleMenu.module.scss'

type Props = {
  editor: Editor
  ref: (el: HTMLElement) => void
}

const backgrounds = [null, 'white', 'black', 'yellow', 'pink', 'green']

export const IncutBubbleMenu = (props: Props) => {
  const { t } = useLocalize()
  const [substratBubbleOpen, setSubstratBubbleOpen] = createSignal(false)
  const handleChangeBg = (bg: string | null) => {
    props.editor?.chain().focus().setArticleBg(bg).run()
    setSubstratBubbleOpen(false)
  }
  return (
    <div ref={props.ref} class={styles.BubbleMenu}>
      <button
        type="button"
        class={styles.bubbleMenuButton}
        onClick={() => props.editor?.chain().focus().setArticleFloat('half-left').run()}
      >
        <Icon name="editor-image-half-align-left" />
      </button>
      <button
        type="button"
        class={styles.bubbleMenuButton}
        onClick={() => props.editor?.chain().focus().setArticleFloat(null).run()}
      >
        <Icon name="editor-image-align-center" />
      </button>

      <button
        type="button"
        class={styles.bubbleMenuButton}
        onClick={() => props.editor?.chain().focus().setArticleFloat('half-right').run()}
      >
        <Icon name="editor-image-half-align-right" />
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
        <Show when={substratBubbleOpen()}>
          <div class={styles.dropDown}>
            <div class={styles.actions}>
              <For each={backgrounds}>
                {(bg) => (
                  <div
                    onClick={() => handleChangeBg(bg)}
                    class={clsx(styles.color, styles[bg as keyof typeof styles])}
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
