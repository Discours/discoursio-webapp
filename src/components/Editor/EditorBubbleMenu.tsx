import type { Editor } from '@tiptap/core'

type BubbleMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

export const EditorBubbleMenu = (props: BubbleMenuProps) => {
  return (
    <div ref={props.ref}>
      <button>bold</button>
    </div>
  )
}
