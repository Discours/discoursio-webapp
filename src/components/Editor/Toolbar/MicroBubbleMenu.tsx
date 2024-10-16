import type { Editor } from '@tiptap/core'
import { clsx } from 'clsx'
import { Accessor, Show, createSignal, onCleanup, onMount } from 'solid-js'
import { Icon } from '~/components/_shared/Icon'
import { useEditorContext } from '~/context/editor'
import { InsertLinkForm } from './InsertLinkForm'
import { ToolbarControl } from './ToolbarControl'

import styles from './MicroBubbleMenu.module.scss'

type MicroBubbleMenuProps = {
  editor: Accessor<Editor | undefined>
  ref?: (el: HTMLDivElement) => void
  noBorders?: boolean
}

export const MicroBubbleMenu = (props: MicroBubbleMenuProps) => {
  const [linkEditorOpen, setLinkEditorOpen] = createSignal(false)
  const { editing } = useEditorContext()

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

  const handleKeyDown = (event: KeyboardEvent) => {
    // handle ctrl+k to insert link
    if (
      event.code === 'KeyK' &&
      (event.metaKey || event.ctrlKey) &&
      !props.editor()?.state.selection.empty
    ) {
      event.preventDefault()
      setLinkEditorOpen((prev) => !prev)
    }

    // handle shift+enter to change focus
    if (event.code === 'Enter' && (event.metaKey || event.shiftKey)) {
      event.preventDefault()
      editing()?.commands.focus()
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
