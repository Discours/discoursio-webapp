import type { Editor } from '@tiptap/core'
import { createEditorTransaction } from 'solid-tiptap'
import { InsertLinkForm } from '../InsertLinkForm'
import styles from './LinkBubbleMenu.scss'

type Props = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
  shouldShow: boolean
}

export const LinkBubbleMenu = (props: Props) => {
  const isActive = (name: string, attributes?: unknown) =>
    createEditorTransaction(
      () => props.editor,
      (editor) => editor && editor.isActive(name, attributes),
    )

  const isLink = isActive('link')

  // const handleKeyDown = async (event) => {
  //   if (event.code === 'KeyK' && (event.metaKey || event.ctrlKey) && !props.editor.state.selection.empty) {
  //     event.preventDefault()
  //     setLinkEditorOpen(true)
  //   }
  // }

  // onMount(() => {
  //   window.addEventListener('keydown', handleKeyDown)
  //   onCleanup(() => {
  //     window.removeEventListener('keydown', handleKeyDown)
  //   })
  // })

  return (
    <div ref={props.ref} class={styles.LinkBubbleMenu}>
      <InsertLinkForm
        editor={props.editor}
        onClose={() => {
          console.log('!!! ON CLOSE:')
        }}
      />
    </div>
  )
}
