import { createEffect, createSignal, onCleanup } from 'solid-js'
import { createTiptapEditor, useEditorHTML } from 'solid-tiptap'
import uniqolor from 'uniqolor'
import * as Y from 'yjs'
import type { Doc } from 'yjs/dist/src/utils/Doc'
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
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { isTextSelection } from '@tiptap/core'
import { Paragraph } from '@tiptap/extension-paragraph'
import Focus from '@tiptap/extension-focus'
import { Collaboration } from '@tiptap/extension-collaboration'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { CustomBlockquote } from './extensions/CustomBlockquote'
import { Figure } from './extensions/Figure'
import { Figcaption } from './extensions/Figcaption'
import { Embed } from './extensions/Embed'
import { useSession } from '../../context/session'
import { useLocalize } from '../../context/localize'
import { useEditorContext } from '../../context/editor'
import { TrailingNode } from './extensions/TrailingNode'
import Article from './extensions/Article'
import { TextBubbleMenu } from './TextBubbleMenu'
import { FigureBubbleMenu, BlockquoteBubbleMenu, IncutBubbleMenu } from './BubbleMenu'
import { EditorFloatingMenu } from './EditorFloatingMenu'
import './Prosemirror.scss'
import { Image } from '@tiptap/extension-image'
import { Footnote } from './extensions/Footnote'

type Props = {
  shoutId: number
  initialContent?: string
  onChange: (text: string) => void
}

const yDocs: Record<string, Doc> = {}
const providers: Record<string, HocuspocusProvider> = {}

export const Editor = (props: Props) => {
  const { t } = useLocalize()
  const { user } = useSession()

  const [isCommonMarkup, setIsCommonMarkup] = createSignal(false)
  const [shouldShowTextBubbleMenu, setShouldShowTextBubbleMenu] = createSignal(false)

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

  const ImageFigure = Figure.extend({
    name: 'capturedImage',
    content: 'figcaption image'
  })

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
        placeholder: t('Add a link or click plus to embed media')
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
      ImageFigure,
      Image,
      Figcaption,
      Footnote,
      Embed,
      CharacterCount.configure(), // https://github.com/ueberdosis/tiptap/issues/2589#issuecomment-1093084689
      BubbleMenu.configure({
        pluginKey: 'textBubbleMenu',
        element: textBubbleMenuRef.current,
        shouldShow: ({ editor: e, view, state, from, to }) => {
          const { doc, selection } = state
          const { empty } = selection
          const isEmptyTextBlock = doc.textBetween(from, to).length === 0 && isTextSelection(selection)
          setIsCommonMarkup(e.isActive('figcaption'))
          const result =
            (view.hasFocus() && !empty && !isEmptyTextBlock && !e.isActive('image')) ||
            e.isActive('footnote')
          setShouldShowTextBubbleMenu(result)
          return result
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
        },
        tippyOptions: {
          offset: [0, 0],
          placement: 'top',
          getReferenceClientRect: () => {
            const selectedElement = editor().view.dom.querySelector('.has-focus')
            if (selectedElement) {
              return selectedElement.getBoundingClientRect()
            }
          }
        }
      }),
      BubbleMenu.configure({
        pluginKey: 'incutBubbleMenu',
        element: incutBubbleMenuRef.current,
        shouldShow: ({ editor: e, state }) => {
          const { selection } = state
          const { empty } = selection
          return empty && e.isActive('article')
        },
        tippyOptions: {
          offset: [0, -16],
          placement: 'top',
          getReferenceClientRect: () => {
            const selectedElement = editor().view.dom.querySelector('.has-focus')
            if (selectedElement) {
              return selectedElement.getBoundingClientRect()
            }
          }
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

  onCleanup(() => {
    editor().destroy()
  })

  return (
    <>
      <div class="row">
        <div class="col-md-5" />
        <div class="col-md-12">
          <div ref={(el) => (editorElRef.current = el)} id="editorBody" />
        </div>
      </div>

      <TextBubbleMenu
        shouldShow={shouldShowTextBubbleMenu()}
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
