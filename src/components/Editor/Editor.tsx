import type { Doc } from 'yjs/dist/src/utils/Doc'

import { HocuspocusProvider } from '@hocuspocus/provider'
import { isTextSelection } from '@tiptap/core'
import { Bold } from '@tiptap/extension-bold'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import { BulletList } from '@tiptap/extension-bullet-list'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { Document } from '@tiptap/extension-document'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { FloatingMenu } from '@tiptap/extension-floating-menu'
import Focus from '@tiptap/extension-focus'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { Highlight } from '@tiptap/extension-highlight'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Image } from '@tiptap/extension-image'
import { Italic } from '@tiptap/extension-italic'
import { Link } from '@tiptap/extension-link'
import { ListItem } from '@tiptap/extension-list-item'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Strike } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import { Underline } from '@tiptap/extension-underline'
import { createEffect, createSignal, onCleanup } from 'solid-js'
import { createTiptapEditor, useEditorHTML } from 'solid-tiptap'
import uniqolor from 'uniqolor'
import * as Y from 'yjs'

import { useEditorContext } from '../../context/editor'
import { useLocalize } from '../../context/localize'
import { useSession } from '../../context/session'
import { useSnackbar } from '../../context/snackbar'
import { handleImageUpload } from '../../utils/handleImageUpload'

import { FigureBubbleMenu, BlockquoteBubbleMenu, IncutBubbleMenu } from './BubbleMenu'
import { EditorFloatingMenu } from './EditorFloatingMenu'
import Article from './extensions/Article'
import { CustomBlockquote } from './extensions/CustomBlockquote'
import { Embed } from './extensions/Embed'
import { Figcaption } from './extensions/Figcaption'
import { Figure } from './extensions/Figure'
import { Footnote } from './extensions/Footnote'
import { TrailingNode } from './extensions/TrailingNode'
import { TextBubbleMenu } from './TextBubbleMenu'

import './Prosemirror.scss'

type Props = {
  shoutId: number
  initialContent?: string
  onChange: (text: string) => void
}

const allowedImageTypes = new Set([
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/tiff',
  'image/webp',
  'image/x-icon',
])

const yDocs: Record<string, Doc> = {}
const providers: Record<string, HocuspocusProvider> = {}

export const Editor = (props: Props) => {
  const { t } = useLocalize()
  const { user } = useSession()

  const [isCommonMarkup, setIsCommonMarkup] = createSignal(false)
  const [shouldShowTextBubbleMenu, setShouldShowTextBubbleMenu] = createSignal(false)

  const {
    actions: { showSnackbar },
  } = useSnackbar()

  const docName = `shout-${props.shoutId}`

  if (!yDocs[docName]) {
    yDocs[docName] = new Y.Doc()
  }

  if (!providers[docName]) {
    providers[docName] = new HocuspocusProvider({
      url: 'wss://hocuspocus.discours.io',
      name: docName,
      document: yDocs[docName],
    })
  }

  const editorElRef: {
    current: HTMLDivElement
  } = {
    current: null,
  }

  const textBubbleMenuRef: {
    current: HTMLDivElement
  } = {
    current: null,
  }

  const incutBubbleMenuRef: {
    current: HTMLElement
  } = {
    current: null,
  }
  const figureBubbleMenuRef: {
    current: HTMLElement
  } = {
    current: null,
  }
  const blockquoteBubbleMenuRef: {
    current: HTMLElement
  } = {
    current: null,
  }

  const floatingMenuRef: {
    current: HTMLDivElement
  } = {
    current: null,
  }

  const ImageFigure = Figure.extend({
    name: 'capturedImage',
    content: 'figcaption image',
  })

  const EmbedFigure = Figure.extend({
    name: 'capturedEmbed',
    content: 'figcaption embed',
  })

  const handleClipboardPaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()

      if (clipboardItems.length === 0) return
      const [clipboardItem] = clipboardItems
      const { types } = clipboardItem
      const imageType = types.find((type) => allowedImageTypes.has(type))

      if (!imageType) return
      const blob = await clipboardItem.getType(imageType)
      const extension = imageType.split('/')[1]
      const file = new File([blob], `clipboardImage.${extension}`)

      const uplFile = {
        source: blob.toString(),
        name: file.name,
        size: file.size,
        file,
      }

      showSnackbar({ body: t('Uploading image') })
      const result = await handleImageUpload(uplFile)

      editor()
        .chain()
        .focus()
        .insertContent({
          type: 'figure',
          attrs: { 'data-type': 'image' },
          content: [
            {
              type: 'figcaption',
              content: [{ type: 'text', text: result.originalFilename }],
            },
            {
              type: 'image',
              attrs: { src: result.url },
            },
          ],
        })
        .run()
    } catch (error) {
      console.error('[Paste Image Error]:', error)
    }
  }

  const { initialContent } = props

  const editor = createTiptapEditor(() => ({
    element: editorElRef.current,
    editorProps: {
      attributes: {
        class: 'articleEditor',
      },
      transformPastedHTML(html) {
        return html.replaceAll(/<img.*?>/g, '')
      },
      handlePaste: () => {
        handleClipboardPaste()
        return false
      },
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
          class: 'horizontalRule',
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Heading.configure({
        levels: [2, 3, 4],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Collaboration.configure({
        document: yDocs[docName],
      }),
      CollaborationCursor.configure({
        provider: providers[docName],
        user: {
          name: user().name,
          color: uniqolor(user().slug).color,
        },
      }),
      Placeholder.configure({
        placeholder: t('Add a link or click plus to embed media'),
      }),
      Focus,
      Gapcursor,
      HardBreak,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'highlight',
        },
      }),
      ImageFigure,
      EmbedFigure,
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
          sticky: true,
        },
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
          },
        },
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
          },
        },
      }),
      BubbleMenu.configure({
        pluginKey: 'imageBubbleMenu',
        element: figureBubbleMenuRef.current,
        shouldShow: ({ editor: e, view }) => {
          return view.hasFocus() && e.isActive('image')
        },
      }),
      FloatingMenu.configure({
        tippyOptions: {
          placement: 'left',
        },
        element: floatingMenuRef.current,
      }),
      TrailingNode,
      Article,
    ],
    enablePasteRules: [Link],
    content: initialContent ?? null,
  }))

  const {
    actions: { countWords, setEditor },
  } = useEditorContext()

  setEditor(editor)

  const html = useEditorHTML(() => editor())

  createEffect(() => {
    props.onChange(html())
    if (html()) {
      countWords({
        characters: editor().storage.characterCount.characters(),
        words: editor().storage.characterCount.words(),
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
