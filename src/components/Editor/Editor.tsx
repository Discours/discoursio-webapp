import { createEffect } from 'solid-js'
import { createTiptapEditor, useEditorHTML } from 'solid-tiptap'
import { useLocalize } from '../../context/localize'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Bold } from '@tiptap/extension-bold'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
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
import { Document } from '@tiptap/extension-document'
import { Text } from '@tiptap/extension-text'
import { Image } from '@tiptap/extension-image'
import { Paragraph } from '@tiptap/extension-paragraph'
import Focus from '@tiptap/extension-focus'
import { TrailingNode } from './extensions/TrailingNode'
import * as Y from 'yjs'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { Collaboration } from '@tiptap/extension-collaboration'
import './Prosemirror.scss'
import { IndexeddbPersistence } from 'y-indexeddb'
import { useSession } from '../../context/session'
import uniqolor from 'uniqolor'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { Embed } from './extensions/embed'
import { TextBubbleMenu } from './TextBubbleMenu'
import { ImageBubbleMenu } from './ImageBubbleMenu'
import { EditorFloatingMenu } from './EditorFloatingMenu'
import { useEditorContext } from '../../context/editor'

type EditorProps = {
  shoutId: number
  initialContent?: string
  onChange: (text: string) => void
}

const yDoc = new Y.Doc()
const persisters: Record<string, IndexeddbPersistence> = {}
const providers: Record<string, HocuspocusProvider> = {}

export const Editor = (props: EditorProps) => {
  const { t } = useLocalize()
  const { user } = useSession()

  const docName = `shout-${props.shoutId}`

  if (!providers[docName]) {
    providers[docName] = new HocuspocusProvider({
      url: 'wss://hocuspocus.discours.io',
      // url: 'ws://localhost:4242',
      name: docName,
      document: yDoc
    })
  }

  if (!persisters[docName]) {
    persisters[docName] = new IndexeddbPersistence(docName, yDoc)
  }

  const editorElRef: {
    current: HTMLDivElement
  } = {
    current: null
  }

  const textBubbleMenuRef: {
    current: HTMLDivElement
  } = {
    current: null
  }

  const imageBubbleMenuRef: {
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
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'horizontalRule'
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false
      }),
      Heading.configure({
        levels: [1, 2, 3]
      }),
      BulletList,
      OrderedList,
      ListItem,
      Collaboration.configure({
        document: yDoc
      }),
      CollaborationCursor.configure({
        provider: providers[docName],
        user: {
          name: user().name,
          color: uniqolor(user().slug).color
        }
      }),
      Placeholder.configure({
        placeholder: t('Short opening')
      }),
      Focus,
      Gapcursor,
      HardBreak,
      Highlight,
      Image.configure({
        HTMLAttributes: {
          class: 'uploadedImage'
        }
      }),
      TrailingNode,
      Embed,
      TrailingNode,
      CharacterCount,
      BubbleMenu.configure({
        pluginKey: 'textBubbleMenu',
        element: textBubbleMenuRef.current
        // shouldShow: ({ editor: e, view, state, oldState, from, to }) => {
        //   console.log('!!! e:', view)
        //   return !e.isActive('image')
        // }
      }),
      BubbleMenu.configure({
        pluginKey: 'imageBubbleMenu',
        element: imageBubbleMenuRef.current,
        shouldShow: ({ editor: e, view, state, oldState, from, to }) => {
          return e.isFocused && e.isActive('image')
        }
      }),
      FloatingMenu.configure({
        tippyOptions: {
          placement: 'left'
        },
        element: floatingMenuRef.current
      })
    ]
  }))

  const html = useEditorHTML(() => editor())

  const {
    actions: { countWords }
  } = useEditorContext()

  createEffect(() => {
    props.onChange(html())
    if (html()) {
      countWords({
        characters: editor().storage.characterCount.characters(),
        words: editor().storage.characterCount.words()
      })
    }
  })

  return (
    <>
      <div ref={(el) => (editorElRef.current = el)} />
      <TextBubbleMenu editor={editor()} ref={(el) => (textBubbleMenuRef.current = el)} />
      <ImageBubbleMenu editor={editor()} ref={(el) => (imageBubbleMenuRef.current = el)} />
      <EditorFloatingMenu editor={editor()} ref={(el) => (floatingMenuRef.current = el)} />
    </>
  )
}
