import type { Editor } from '@tiptap/core'
import { Accessor, Show, createSignal, onCleanup, onMount } from 'solid-js'
import { Icon } from '~/components/_shared/Icon'
import { InsertLinkForm } from './InsertLinkForm'

import clsx from 'clsx'
import styles from './MicroBubbleMenu.module.scss'
import ToolbarControl from './ToolbarControl'

type MicroBubbleMenuProps = {
  editor: Accessor<Editor | undefined>
  ref?: (el: HTMLDivElement) => void
  noBorders?: boolean
}

export const MicroBubbleMenu = (props: MicroBubbleMenuProps) => {
  const [linkEditorOpen, setLinkEditorOpen] = createSignal(false)

  const handleOpenLinkForm = () => {
    const { from, to } = props.editor()!.state.selection
    props.editor()?.chain().focus().setTextSelection({ from, to }).run()
    setLinkEditorOpen(true)
  }

  const handleCloseLinkForm = () => {
    setLinkEditorOpen(false)
    // Снимаем выделение, устанавливая курсор в конец текущего выделения
    const { to } = props.editor()!.state.selection
    props.editor()?.chain().focus().setTextSelection(to).run()
  }

  // handle ctrl+k to insert link
  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.code === 'KeyK' &&
      (event.metaKey || event.ctrlKey) &&
      !props.editor()?.state.selection.empty
    ) {
      event.preventDefault()
      setLinkEditorOpen((prev) => !prev)
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })
  })

  return (
    <div ref={props.ref} class={clsx(styles.MicroBubbleMenu, { [styles.noBorders]: props.noBorders })}>
      <Show
        when={!linkEditorOpen()}
        fallback={<InsertLinkForm editor={props.editor() as Editor} onClose={handleCloseLinkForm} />}
      >
        <ToolbarControl
          key="bold"
          editor={props.editor()}
          onChange={() => props.editor()?.chain().focus().toggleBold().run()}
        >
          <Icon name="editor-bold" />
        </ToolbarControl>
        <ToolbarControl
          key="italic"
          editor={props.editor()}
          onChange={() => props.editor()?.chain().focus().toggleItalic().run()}
        >
          <Icon name="editor-italic" />
        </ToolbarControl>
        <ToolbarControl key="link" editor={props.editor()} onChange={handleOpenLinkForm}>
          <Icon name="editor-link" />
        </ToolbarControl>
      </Show>
    </div>
  )
}

export default MicroBubbleMenu
