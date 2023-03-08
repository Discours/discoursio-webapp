import type { Editor } from '@tiptap/core'
import styles from './EditorFloatingMenu.module.scss'

type FloatingMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

export const EditorFloatingMenu = (props: FloatingMenuProps) => {
  return (
    <div ref={props.ref} class={styles.editorFloatingMenu}>
      <button>+</button>
    </div>
  )
}
