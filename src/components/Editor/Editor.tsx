import { HocuspocusProvider } from '@hocuspocus/provider'
import { Editor, EditorOptions, isTextSelection } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { FloatingMenu } from '@tiptap/extension-floating-menu'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Show, createEffect, createMemo, createSignal, on, onCleanup } from 'solid-js'
import uniqolor from 'uniqolor'
import { Doc, Transaction } from 'yjs'
import { useEditorContext } from '~/context/editor'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useSnackbar } from '~/context/ui'
import { Author } from '~/graphql/schema/core.gen'
import { base, custom, extended } from '~/lib/editorExtensions'
import { handleImageUpload } from '~/lib/handleImageUpload'
import { BlockquoteBubbleMenu, FigureBubbleMenu, IncutBubbleMenu } from './BubbleMenu'
import { EditorFloatingMenu } from './EditorFloatingMenu'
import { TextBubbleMenu } from './TextBubbleMenu'
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
  const { createEditor, countWords, editor } = useEditorContext()
  const [editorOptions, setEditorOptions] = createSignal<Partial<EditorOptions>>({})
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
    return false
  }

  createEffect(
    on([editorOptions, editorElRef, author], ([opts, element, a]) => {
      if (!opts && a && element) {
        const options = {
          element: editorElRef()!,
          editorProps: {
            attributes: { class: 'articleEditor' },
            transformPastedHTML: (c: string) => c.replaceAll(/<img.*?>/g, ''),
            handlePaste: handleClipboardPaste
          },
          extensions: [
            ...base,
            ...custom,
            ...extended,

            Placeholder.configure({ placeholder: t('Add a link or click plus to embed media') }),
            CharacterCount.configure(), // https://github.com/ueberdosis/tiptap/issues/2589#issuecomment-1093084689

            // menus

            BubbleMenu.configure({
              pluginKey: 'textBubbleMenu',
              element: textBubbleMenuRef(),
              shouldShow: ({ editor: e, view, state: { doc, selection }, from, to }) => {
                const isEmptyTextBlock =
                  doc.textBetween(from, to).length === 0 && isTextSelection(selection)
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
            })

            // dynamic
            // Collaboration.configure({ document: yDocs[docName] }),
            // CollaborationCursor.configure({ provider: providers[docName], user: { name: a.name, color: uniqolor(a.slug).color } }),
          ],
          onTransaction({ transaction, editor }: { transaction: Transaction; editor: Editor }) {
            if (transaction.changed) {
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
        }
        setEditorOptions(options as unknown as Partial<EditorOptions>)
        createEditor(options as unknown as Partial<EditorOptions>)
      }
    })
  )

  createEffect(
    on(
      [
        editor,
        () => !props.disableCollaboration,
        () => `shout-${props.shoutId}`,
        () => session()?.access_token || '',
        author
      ],
      ([e, collab, docName, token, profile]) => {
        if (!e) return

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
          createEditor({
            ...editorOptions(),
            extensions: [
              ...(editor()?.options.extensions || []),
              Collaboration.configure({ document: yDocs[docName] }),
              CollaborationCursor.configure({
                provider: providers[docName],
                user: { name: profile.name, color: uniqolor(profile.slug).color }
              })
            ]
          })
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
