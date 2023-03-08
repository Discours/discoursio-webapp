import { createTiptapEditor } from 'solid-tiptap'
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
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
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
import { History } from '@tiptap/extension-history'
import { Paragraph } from '@tiptap/extension-paragraph'
import Focus from '@tiptap/extension-focus'
import { TrailingNode } from './extensions/TrailingNode'
import './Prosemirror.scss'
import styles from './Editor.module.scss'
import { Show } from 'solid-js'
import { EditorBubbleMenu } from './EditorBubbleMenu'
import { EditorFloatingMenu } from './EditorFloatingMenu'

type EditorProps = {
  initialContent?: string
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
      Link,
      Youtube,
      TrailingNode
    ]
  }))

  return (
    <div class={clsx('container', styles.container)}>
      <div class={styles.editor} ref={(el) => (editorElRef.current = el)} />
      <EditorBubbleMenu editor={editor()} ref={(el) => (bubbleMenuRef.current = el)} />
      <EditorFloatingMenu editor={editor()} ref={(el) => (floatingMenuRef.current = el)} />
    </div>
  )
}

export default Editor
