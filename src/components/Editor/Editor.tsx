import { HocuspocusProvider } from '@hocuspocus/provider'
import { Editor, isTextSelection } from '@tiptap/core'
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
import { Show, createEffect, createMemo, createSignal, on, onCleanup } from 'solid-js'
import { createTiptapEditor, useEditorHTML } from 'solid-tiptap'
import uniqolor from 'uniqolor'
import { Doc } from 'yjs'

import { useSnackbar } from '~/context/ui'
import { useEditorContext } from '../../context/editor'
import { useLocalize } from '../../context/localize'
import { useSession } from '../../context/session'
import { handleImageUpload } from '../../utils/handleImageUpload'

import { BlockquoteBubbleMenu, FigureBubbleMenu, IncutBubbleMenu } from './BubbleMenu'
import { EditorFloatingMenu } from './EditorFloatingMenu'
import { TextBubbleMenu } from './TextBubbleMenu'
import Article from './extensions/Article'
import { CustomBlockquote } from './extensions/CustomBlockquote'
import { Figcaption } from './extensions/Figcaption'
import { Figure } from './extensions/Figure'
import { Footnote } from './extensions/Footnote'
import { Iframe } from './extensions/Iframe'
import { Span } from './extensions/Span'
import { ToggleTextWrap } from './extensions/ToggleTextWrap'
import { TrailingNode } from './extensions/TrailingNode'

import './Prosemirror.scss'
import { Author } from '~/graphql/schema/core.gen'

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

export const EditorComponent = (props: Props) => {
  const { t } = useLocalize()
  const { session } = useSession()
  const author = createMemo<Author>(() => session()?.user?.app_data?.profile as Author)
  const [isCommonMarkup, setIsCommonMarkup] = createSignal(false)
  const [shouldShowTextBubbleMenu, setShouldShowTextBubbleMenu] = createSignal(false)
  const { showSnackbar } = useSnackbar()

  const docName = `shout-${props.shoutId}`

  if (!yDocs[docName]) {
    yDocs[docName] = new Doc()
  }

  if (!providers[docName]) {
    providers[docName] = new HocuspocusProvider({
      url: 'wss://hocuspocus.discours.io',
      name: docName,
      document: yDocs[docName],
      token: session()?.access_token || '',
    })
  }

  const [editorElRef, setEditorElRef] = createSignal<HTMLElement>()
  let textBubbleMenuRef: HTMLDivElement | undefined
  let incutBubbleMenuRef: HTMLElement | undefined
  let figureBubbleMenuRef: HTMLElement | undefined
  let blockquoteBubbleMenuRef: HTMLElement | undefined
  let floatingMenuRef: HTMLDivElement | undefined

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
      const result = await handleImageUpload(uplFile, session()?.access_token || '')

      editor()
        ?.chain()
        .focus()
        .insertContent({
          type: 'figure',
          attrs: { 'data-type': 'image' },
          content: [
            {
              type: 'image',
              attrs: { src: result.url },
            },
            {
              type: 'figcaption',
              content: [{ type: 'text', text: result.originalFilename }],
            },
          ],
        })
        .run()
    } catch (error) {
      console.error('[Paste Image Error]:', error)
    }
  }

  const { initialContent } = props
  const { editor, setEditor, countWords } = useEditorContext()
  createEffect(
    on(editorElRef, (ee: HTMLElement | undefined) => {
      if (ee) {
        const freshEditor = createTiptapEditor<HTMLElement>(() => ({
          element: ee,
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
            Span,
            ToggleTextWrap,
            Strike,
            HorizontalRule.configure({
              HTMLAttributes: {
                class: 'horizontalRule',
              },
            }),
            Underline,
            Link.extend({
              inclusive: false,
            }).configure({
              autolink: true,
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
                name: author().name,
                color: uniqolor(author().slug).color,
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
            Image,
            Iframe,
            Figure,
            Figcaption,
            Footnote,
            ToggleTextWrap,
            CharacterCount.configure(), // https://github.com/ueberdosis/tiptap/issues/2589#issuecomment-1093084689
            BubbleMenu.configure({
              pluginKey: 'textBubbleMenu',
              element: textBubbleMenuRef,
              shouldShow: ({ editor: e, view, state, from, to }) => {
                const { doc, selection } = state
                const { empty } = selection
                const isEmptyTextBlock =
                  doc.textBetween(from, to).length === 0 && isTextSelection(selection)
                if (isEmptyTextBlock) {
                  e.chain().focus().removeTextWrap({ class: 'highlight-fake-selection' }).run()
                }
                setIsCommonMarkup(e.isActive('figcaption'))
                const result =
                  (view.hasFocus() &&
                    !empty &&
                    !isEmptyTextBlock &&
                    !e.isActive('image') &&
                    !e.isActive('figure')) ||
                  e.isActive('footnote') ||
                  (e.isActive('figcaption') && !empty)
                setShouldShowTextBubbleMenu(result)
                return result
              },
              tippyOptions: {
                onHide: () => {
                  const fe = freshEditor() as Editor
                  fe?.commands.focus()
                },
              },
            }),
            BubbleMenu.configure({
              pluginKey: 'blockquoteBubbleMenu',
              element: blockquoteBubbleMenuRef,
              shouldShow: ({ editor: e, view, state }) => {
                const { empty } = state.selection
                return view.hasFocus() && !empty && e.isActive('blockquote')
              },
            }),
            BubbleMenu.configure({
              pluginKey: 'figureBubbleMenu',
              element: figureBubbleMenuRef,
              shouldShow: ({ editor: e, view, state }) => {
                const { empty } = state.selection
                return view.hasFocus() && !empty && e.isActive('figure')
              },
            }),
            BubbleMenu.configure({
              pluginKey: 'incutBubbleMenu',
              element: incutBubbleMenuRef,
              shouldShow: ({ editor: e, view, state }) => {
                const { empty } = state.selection
                return view.hasFocus() && !empty && e.isActive('figcaption')
              },
            }),
            FloatingMenu.configure({
              element: floatingMenuRef,
              pluginKey: 'floatingMenu',
              shouldShow: ({ editor: e, state }) => {
                const { $anchor, empty } = state.selection
                const isRootDepth = $anchor.depth === 1

                if (!(isRootDepth && empty)) return false

                return !(e.isActive('codeBlock') || e.isActive('heading'))
              },
            }),
            TrailingNode,
            Article,
          ],
          onTransaction: ({ transaction }) => {
            if (transaction.docChanged) {
              const fe = freshEditor()
              if (fe) {
                const changeHandle = useEditorHTML(() => fe as Editor | undefined)
                props.onChange(changeHandle() || '')
                countWords(fe?.storage.characterCount.words())
              }
            }
          },
          content: initialContent,
        }))

        if (freshEditor) {
          editorElRef()?.addEventListener('focus', (_event) => {
            if (freshEditor()?.isActive('figcaption')) {
              freshEditor()?.commands.focus()
            }
          })
          setEditor(freshEditor() as Editor)
        }
      }
    }),
  )

  onCleanup(() => {
    editor()?.destroy()
  })

  return (
    <>
      <div class="row">
        <div class="col-md-5" />
        <div class="col-md-12">
          <div ref={setEditorElRef} id="editorBody" />
        </div>
      </div>
      <Show when={editor()}>
        <TextBubbleMenu
          shouldShow={shouldShowTextBubbleMenu()}
          isCommonMarkup={isCommonMarkup()}
          editor={editor() as Editor}
          ref={(el) => (textBubbleMenuRef = el)}
        />
        <BlockquoteBubbleMenu
          ref={(el) => {
            blockquoteBubbleMenuRef = el
          }}
          editor={editor() as Editor}
        />
        <FigureBubbleMenu
          editor={editor() as Editor}
          ref={(el) => {
            figureBubbleMenuRef = el
          }}
        />
        <IncutBubbleMenu
          editor={editor() as Editor}
          ref={(el) => {
            incutBubbleMenuRef = el
          }}
        />
        <EditorFloatingMenu editor={editor() as Editor} ref={(el) => (floatingMenuRef = el)} />
      </Show>
    </>
  )
}
