import type { Editor } from '@tiptap/core'

import { InsertLinkForm } from '../InsertLinkForm'

import styles from './LinkBubbleMenu.module.scss'

type Props = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
  onClose: () => void
}

export const LinkBubbleMenuModule = (props: Props) => {
  return (
    <div ref={props.ref} class={styles.LinkBubbleMenu}>
      <InsertLinkForm editor={props.editor} onClose={props.onClose} />
    </div>
  )
}
