import { createEffect, createSignal } from 'solid-js'
import { createTiptapEditor, useEditorHTML } from 'solid-tiptap'
import { useLocalize } from '../../context/localize'
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
import { CustomImage } from './extensions/CustomImage'
import { CustomBlockquote } from './extensions/CustomBlockquote'
import { Figure } from './extensions/Figure'
import { Paragraph } from '@tiptap/extension-paragraph'
import Focus from '@tiptap/extension-focus'
import * as Y from 'yjs'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { Collaboration } from '@tiptap/extension-collaboration'
import { IndexeddbPersistence } from 'y-indexeddb'
import { useSession } from '../../context/session'
import uniqolor from 'uniqolor'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { Embed } from './extensions/Embed'
import { TextBubbleMenu } from './TextBubbleMenu'
import { FigureBubbleMenu, BlockquoteBubbleMenu, IncutBubbleMenu } from './BubbleMenu'
import { EditorFloatingMenu } from './EditorFloatingMenu'
import { useEditorContext } from '../../context/editor'
import { isTextSelection } from '@tiptap/core'
import type { Doc } from 'yjs/dist/src/utils/Doc'
import './Prosemirror.scss'
import { TrailingNode } from './extensions/TrailingNode'
import Article from './extensions/Article'

type Props = {
  shoutId: number
  initialContent?: string
  onChange: (text: string) => void
}

const yDocs: Record<string, Doc> = {}
const persisters: Record<string, IndexeddbPersistence> = {}
const providers: Record<string, HocuspocusProvider> = {}

export const Editor = (props: Props) => {
  const { t } = useLocalize()
  const { user } = useSession()
  const [isCommonMarkup, setIsCommonMarkup] = createSignal(false)

  const docName = `shout-${props.shoutId}`

  if (!yDocs[docName]) {
    yDocs[docName] = new Y.Doc()
  }

  if (!providers[docName]) {
    providers[docName] = new HocuspocusProvider({
      url: 'wss://hocuspocus.discours.io',
      name: docName,
      document: yDocs[docName]
    })
  }

  if (!persisters[docName]) {
    persisters[docName] = new IndexeddbPersistence(docName, yDocs[docName])
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

  const incutBubbleMenuRef: {
    current: HTMLElement
  } = {
    current: null
  }
  const figureBubbleMenuRef: {
    current: HTMLElement
  } = {
    current: null
  }
  const blockquoteBubbleMenuRef: {
    current: HTMLElement
  } = {
    current: null
  }

  const floatingMenuRef: {
    current: HTMLDivElement
  } = {
    current: null
  }
  const { initialContent } = props
  const editor = createTiptapEditor(() => ({
    element: editorElRef.current,
    editorProps: {
      attributes: {
        class: 'articleEditor'
      }
    },
    extensions: [
      Document,
      Text,
      Paragraph,
      Dropcursor,
      CustomBlockquote,
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
        levels: [2, 3, 4]
      }),
      BulletList,
      OrderedList,
      ListItem,
      Collaboration.configure({
        document: yDocs[docName]
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
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'highlight'
        }
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: 'uploadedImage'
        }
      }),
      Figure,
      Embed,
      CharacterCount,
      BubbleMenu.configure({
        pluginKey: 'textBubbleMenu',
        element: textBubbleMenuRef.current,
        shouldShow: ({ editor: e, view, state, from, to }) => {
          const { doc, selection } = state
          const { empty } = selection
          const isEmptyTextBlock = doc.textBetween(from, to).length === 0 && isTextSelection(selection)

          setIsCommonMarkup(e.isActive('figure'))
          return view.hasFocus() && !empty && !isEmptyTextBlock && !e.isActive('image')
        },
        tippyOptions: {
          sticky: true
        }
      }),
      BubbleMenu.configure({
        pluginKey: 'blockquoteBubbleMenu',
        element: blockquoteBubbleMenuRef.current,
        shouldShow: ({ editor: e, state }) => {
          const { selection } = state
          const { empty } = selection
          return empty && e.isActive('blockquote')
        }
      }),
      BubbleMenu.configure({
        pluginKey: 'incutBubbleMenu',
        element: incutBubbleMenuRef.current,
        shouldShow: ({ editor: e, state }) => {
          const { selection } = state
          const { empty } = selection
          return empty && e.isActive('article')
        }
      }),
      BubbleMenu.configure({
        pluginKey: 'imageBubbleMenu',
        element: figureBubbleMenuRef.current,
        shouldShow: ({ editor: e, view }) => {
          return view.hasFocus() && e.isActive('image')
        }
      }),
      FloatingMenu.configure({
        tippyOptions: {
          placement: 'left'
        },
        element: floatingMenuRef.current
      }),
      TrailingNode,
      Article
    ],
    content: initialContent ?? null
  }))

  const {
    actions: { countWords, setEditor }
  } = useEditorContext()

  setEditor(editor)

  const html = useEditorHTML(() => editor())

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
      <TextBubbleMenu
        isCommonMarkup={isCommonMarkup()}
        editor={editor()}
        ref={(el) => (textBubbleMenuRef.current = el)}
      />
      <BlockquoteBubbleMenu
        ref={(el) => {
          blockquoteBubbleMenuRef.current = el
        }}
        editor={editor()}
      />
      <FigureBubbleMenu
        editor={editor()}
        ref={(el) => {
          figureBubbleMenuRef.current = el
        }}
      />
      <IncutBubbleMenu
        editor={editor()}
        ref={(el) => {
          incutBubbleMenuRef.current = el
        }}
      />
      <EditorFloatingMenu editor={editor()} ref={(el) => (floatingMenuRef.current = el)} />
    </>
  )
}
