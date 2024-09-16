import { HocuspocusProvider } from '@hocuspocus/provider'
import { Editor, EditorOptions, isTextSelection } from '@tiptap/core'
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
import { createTiptapEditor } from 'solid-tiptap'
import uniqolor from 'uniqolor'
import { Doc } from 'yjs'
import { useEditorContext } from '~/context/editor'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useSnackbar } from '~/context/ui'
import { Author } from '~/graphql/schema/core.gen'
import { handleImageUpload } from '~/lib/handleImageUpload'
import { BlockquoteBubbleMenu, FigureBubbleMenu, IncutBubbleMenu } from './BubbleMenu'
import { EditorFloatingMenu } from './EditorFloatingMenu'
import { TextBubbleMenu } from './TextBubbleMenu'
import { ArticleNode } from './extensions/Article'
import { CustomBlockquote } from './extensions/CustomBlockquote'
import { Figcaption } from './extensions/Figcaption'
import { Figure } from './extensions/Figure'
import { Footnote } from './extensions/Footnote'
import { Iframe } from './extensions/Iframe'
import { Span } from './extensions/Span'
import { ToggleTextWrap } from './extensions/ToggleTextWrap'
import { TrailingNode } from './extensions/TrailingNode'
import { renderUploadedImage } from './renderUploadedImage'

import './Prosemirror.scss'

export type EditorComponentProps = {
  shoutId: number
  initialContent?: string
  onChange: (text: string) => void
  disableCollaboration?: boolean
}

const allowedImageTypes = new Set([
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/tiff',
  'image/webp',
  'image/x-icon'
])

const yDocs: Record<string, Doc> = {}
const providers: Record<string, HocuspocusProvider> = {}

export const EditorComponent = (props: EditorComponentProps) => {
  const { t } = useLocalize()
  const { session } = useSession()
  const author = createMemo<Author>(() => session()?.user?.app_data?.profile as Author)
  const [isCommonMarkup, setIsCommonMarkup] = createSignal(false)
  const [shouldShowTextBubbleMenu, setShouldShowTextBubbleMenu] = createSignal(false)
  const { showSnackbar } = useSnackbar()
  const { setEditor, countWords } = useEditorContext()
  const [extensions, setExtensions] = createSignal<EditorOptions['extensions']>([])
  const [editorElRef, setEditorElRef] = createSignal<HTMLElement | undefined>()
  const [textBubbleMenuRef, setTextBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [incutBubbleMenuRef, setIncutBubbleMenuRef] = createSignal<HTMLElement | undefined>()
  const [figureBubbleMenuRef, setFigureBubbleMenuRef] = createSignal<HTMLElement | undefined>()
  const [blockquoteBubbleMenuRef, setBlockquoteBubbleMenuRef] = createSignal<HTMLElement | undefined>()
  const [floatingMenuRef, setFloatingMenuRef] = createSignal<HTMLDivElement | undefined>()

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
        file
      }

      showSnackbar({ body: t('Uploading image') })
      const image = await handleImageUpload(uplFile, session()?.access_token || '')
      renderUploadedImage(editor() as Editor, image)
    } catch (error) {
      console.error('[Paste Image Error]:', error)
    }
  }

  const editor = createTiptapEditor(() => ({
    element: editorElRef()!,
    editorProps: {
      attributes: {
        class: 'articleEditor'
      },
      transformPastedHTML(html) {
        return html.replaceAll(/<img.*?>/g, '')
      },
      handlePaste: () => {
        handleClipboardPaste()
        return false
      }
    },
    extensions: extensions(),
    onTransaction: ({ transaction, editor }) => {
      if (transaction.docChanged) {
        // Get the current HTML content from the editor
        const html = editor.getHTML()

        // Trigger the onChange callback with the updated HTML
        html && props.onChange(html)

        // Get the word count from the editor's storage (using CharacterCount)
        const wordCount = editor.storage.characterCount.words()

        // Update the word count
        wordCount && countWords(wordCount)
      }
    },
    content: props.initialContent || ''
  }))

  createEffect(() => editor() && setEditor(editor() as Editor))

  createEffect(
    on(
      [extensions, editorElRef, author, () => `shout-${props.shoutId}`],
      ([eee, element, a, docName]) =>
        eee.length === 0 &&
        a &&
        element &&
        setExtensions([
          Document,
          Text,
          Paragraph,
          Bold,
          Italic,
          Strike,
          Heading.configure({ levels: [2, 3, 4] }),
          BulletList,
          OrderedList,
          ListItem,

          HorizontalRule.configure({ HTMLAttributes: { class: 'horizontalRule' } }),
          Dropcursor,
          CustomBlockquote,
          Span,
          ToggleTextWrap,
          Underline,
          Link.extend({ inclusive: false }).configure({ autolink: true, openOnClick: false }),
          Collaboration.configure({ document: yDocs[docName] }),
          CollaborationCursor.configure({
            provider: providers[docName],
            user: { name: a.name, color: uniqolor(a.slug).color }
          }),
          Placeholder.configure({ placeholder: t('Add a link or click plus to embed media') }),
          Focus,
          Gapcursor,
          HardBreak,
          Highlight.configure({ multicolor: true, HTMLAttributes: { class: 'highlight' } }),
          Image,
          Iframe,
          Figure,
          Figcaption,
          Footnote,
          ToggleTextWrap,
          CharacterCount.configure(), // https://github.com/ueberdosis/tiptap/issues/2589#issuecomment-1093084689
          BubbleMenu.configure({
            pluginKey: 'textBubbleMenu',
            element: textBubbleMenuRef(),
            shouldShow: ({ editor: e, view, state: { doc, selection }, from, to }) => {
              const isEmptyTextBlock = doc.textBetween(from, to).length === 0 && isTextSelection(selection)
              isEmptyTextBlock &&
                e?.chain().focus().removeTextWrap({ class: 'highlight-fake-selection' }).run()

              setIsCommonMarkup(e?.isActive('figcaption'))
              const result =
                (view.hasFocus() &&
                  !selection.empty &&
                  !isEmptyTextBlock &&
                  !e.isActive('image') &&
                  !e.isActive('figure')) ||
                e.isActive('footnote') ||
                (e.isActive('figcaption') && !selection.empty)
              setShouldShowTextBubbleMenu(result)
              return result
            },
            tippyOptions: {
              onHide: () => editor()?.commands.focus() as false
            }
          }),
          BubbleMenu.configure({
            pluginKey: 'blockquoteBubbleMenu',
            element: blockquoteBubbleMenuRef(),
            shouldShow: ({ editor: e, view, state }) =>
              view.hasFocus() && !state.selection.empty && e.isActive('blockquote')
          }),
          BubbleMenu.configure({
            pluginKey: 'figureBubbleMenu',
            element: figureBubbleMenuRef(),
            shouldShow: ({ editor: e, view, state }) =>
              view.hasFocus() && !state.selection.empty && e.isActive('figure')
          }),
          BubbleMenu.configure({
            pluginKey: 'incutBubbleMenu',
            element: incutBubbleMenuRef(),
            shouldShow: ({ editor: e, view, state }) =>
              view.hasFocus() && !state.selection.empty && e.isActive('figcaption')
          }),
          FloatingMenu.configure({
            element: floatingMenuRef(),
            pluginKey: 'floatingMenu',
            shouldShow: ({ editor: e, state: { selection } }) => {
              const isRootDepth = selection.$anchor.depth === 1
              if (!(isRootDepth && selection.empty)) return false
              return !(e.isActive('codeBlock') || e.isActive('heading'))
            }
          }),
          TrailingNode,
          ArticleNode
        ])
    )
  )

  createEffect(
    on(
      [
        () => !props.disableCollaboration,
        () => `shout-${props.shoutId}`,
        () => session()?.access_token || '',
        author
      ],
      ([collab, docName, token, profile]) => {
        if (!yDocs[docName]) {
          yDocs[docName] = new Doc()
        }

        if (!providers[docName]) {
          providers[docName] = new HocuspocusProvider({
            url: 'wss://hocuspocus.discours.io',
            name: docName,
            document: yDocs[docName],
            token
          })
        }

        collab &&
          setExtensions((old: EditorOptions['extensions']) => [
            ...old,
            Collaboration.configure({ document: yDocs[docName] }),
            CollaborationCursor.configure({
              provider: providers[docName],
              user: {
                name: profile.name,
                color: uniqolor(profile.slug).color
              }
            })
          ])
      }
    )
  )

  createEffect(
    on(editorElRef, (ee: HTMLElement | undefined) => {
      ee?.addEventListener('focus', (_event) => {
        if (editor()?.isActive('figcaption')) {
          editor()?.commands.focus()
        }
      })
    })
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
          ref={setTextBubbleMenuRef}
        />
        <BlockquoteBubbleMenu ref={setBlockquoteBubbleMenuRef} editor={editor() as Editor} />
        <FigureBubbleMenu editor={editor() as Editor} ref={setFigureBubbleMenuRef} />
        <IncutBubbleMenu editor={editor() as Editor} ref={setIncutBubbleMenuRef} />
        <EditorFloatingMenu editor={editor() as Editor} ref={setFloatingMenuRef} />
      </Show>
    </>
  )
}
