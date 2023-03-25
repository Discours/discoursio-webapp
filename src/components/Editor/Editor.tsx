import { createEffect } from 'solid-js'
import { createTiptapEditor, useEditorHTML } from 'solid-tiptap'
import { clsx } from 'clsx'
import { useLocalize } from '../../context/localize'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Bold } from '@tiptap/extension-bold'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Italic } from '@tiptap/extension-italic'
import { Strike } from '@tiptap/extension-strike'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Underline } from '@tiptap/extension-underline'
import { FloatingMenu } from '@tiptap/extension-floating-menu'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { ListItem } from '@tiptap/extension-list-item'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import { Youtube } from '@tiptap/extension-youtube'
import { Document } from '@tiptap/extension-document'
import { Text } from '@tiptap/extension-text'
import { Image } from '@tiptap/extension-image'
import { Paragraph } from '@tiptap/extension-paragraph'
import Focus from '@tiptap/extension-focus'
import { TrailingNode } from './extensions/TrailingNode'
import { EditorBubbleMenu } from './EditorBubbleMenu/EditorBubbleMenu'
import { EditorFloatingMenu } from './EditorFloatingMenu'
import './Prosemirror.scss'

type EditorProps = {
  initialContent?: string
  onChange: (text: string) => void
}

// const ydoc = new Y.Doc()
// // TODO
// const provider = new WebrtcProvider('slug!!!!!!', ydoc)

export const Editor = (props: EditorProps) => {
  const { t } = useLocalize()

  const editorElRef: {
    current: HTMLDivElement
  } = {
    current: null
  }

  const bubbleMenuRef: {
    current: HTMLDivElement
  } = {
    current: null
  }

  const floatingMenuRef: {
    current: HTMLDivElement
  } = {
    current: null
  }

  const editor = createTiptapEditor(() => ({
    element: editorElRef.current,
    extensions: [
      Document,
      Text,
      Paragraph,
      Dropcursor,
      Blockquote,
      Bold,
      Italic,
      Strike,
      HorizontalRule,
      Underline,
      Link.configure({
        openOnClick: false
      }),
      Heading.configure({
        levels: [1, 2, 3]
      }),
      BubbleMenu.configure({
        element: bubbleMenuRef.current
      }),
      FloatingMenu.configure({
        tippyOptions: {
          placement: 'left'
        },
        element: floatingMenuRef.current
      }),
      BulletList,
      OrderedList,
      ListItem,
      CharacterCount,
      // Collaboration.configure({
      //   document: ydoc
      // }),
      // CollaborationCursor.configure({
      //   provider,
      //   user: {
      //     name: 'Cyndi Lauper',
      //     color: '#f783ac'
      //   }
      // }),
      // TODO conditional indexedDB
      // History,
      Placeholder.configure({
        placeholder: t('Short opening')
      }),
      Focus,
      Gapcursor,
      HardBreak,
      Heading,
      Highlight,
      Image,
      Youtube,
      TrailingNode
    ]
  }))

  const html = useEditorHTML(() => editor())

  createEffect(() => {
    props.onChange(html())
  })

  return (
    <>
      <div ref={(el) => (editorElRef.current = el)} />
      <EditorBubbleMenu editor={editor()} ref={(el) => (bubbleMenuRef.current = el)} />
      <EditorFloatingMenu editor={editor()} ref={(el) => (floatingMenuRef.current = el)} />
    </>
  )
}

export default Editor
