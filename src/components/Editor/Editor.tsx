import { HocuspocusProvider } from '@hocuspocus/provider'
import { UploadFile } from '@solid-primitives/upload'
import { Editor, EditorOptions } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { FloatingMenu } from '@tiptap/extension-floating-menu'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Accessor, createEffect, createMemo, createSignal, on, onCleanup, onMount } from 'solid-js'
import { isServer } from 'solid-js/web'
import { createEditorTransaction, createTiptapEditor } from 'solid-tiptap'
import uniqolor from 'uniqolor'
import { Doc } from 'yjs'
import { useEditorContext } from '~/context/editor'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useSnackbar } from '~/context/ui'
import { Author } from '~/graphql/schema/core.gen'
import { base, custom, extended } from '~/lib/editorExtensions'
import { handleImageUpload } from '~/lib/handleImageUpload'
import { allowedImageTypes, renderUploadedImage } from '../Upload/renderUploadedImage'
import { BlockquoteBubbleMenu } from './Toolbar/BlockquoteBubbleMenu'
import { EditorFloatingMenu } from './Toolbar/EditorFloatingMenu'
import { FigureBubbleMenu } from './Toolbar/FigureBubbleMenu'
import { FullBubbleMenu } from './Toolbar/FullBubbleMenu'
import { IncutBubbleMenu } from './Toolbar/IncutBubbleMenu'

import styles from './Editor.module.scss'

export type EditorComponentProps = {
  shoutId: number
  initialContent?: string
  onChange: (text: string) => void
}

const yDocs: Record<string, Doc> = {}
const providers: Record<string, HocuspocusProvider> = {}

export const EditorComponent = (props: EditorComponentProps) => {
  const { t } = useLocalize()
  const { session, requireAuthentication } = useSession()
  const author = createMemo<Author>(() => session()?.user?.app_data?.profile as Author)
  const [isCommonMarkup, setIsCommonMarkup] = createSignal(false)
  const { showSnackbar } = useSnackbar()
  const { countWords, setEditing, isCollabMode } = useEditorContext()
  const [editorOptions, setEditorOptions] = createSignal<Partial<EditorOptions>>({})
  const [editorElRef, setEditorElRef] = createSignal<HTMLElement | undefined>()
  const [incutBubbleMenuRef, setIncutBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [figureBubbleMenuRef, setFigureBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [blockquoteBubbleMenuRef, setBlockquoteBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [floatingMenuRef, setFloatingMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [fullBubbleMenuRef, setFullBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [editor, setEditor] = createSignal<Editor | null>(null)
  const [menusInitialized, setMenusInitialized] = createSignal(false)
  const [shouldShowFullBubbleMenu, setShouldShowFullBubbleMenu] = createSignal(false)

  // store tiptap editor in context provider's signal to use it in Panel
  createEffect(() => setEditing(editor() || undefined))

  /**
   * Создает экземпляр редактора с заданными опциями
   * @param opts Опции редактора
   */
  const createEditorInstance = (opts?: Partial<EditorOptions>) => {
    if (!opts?.element) {
      console.error('Editor options or element is missing')
      return
    }
    console.log('stage 2: create editor instance without menus', opts)

    const old = editor() || { options: {} as EditorOptions }
    const uniqueExtensions = [
      ...new Map(
        [...(old?.options?.extensions || []), ...(opts?.extensions || [])].map((ext) => [ext.name, ext])
      ).values()
    ]

    const fresh = createTiptapEditor(() => ({
      ...old?.options,
      ...opts,
      element: opts.element as HTMLElement,
      extensions: uniqueExtensions
    }))
    if (old instanceof Editor) old?.destroy()
    setEditor(fresh() || null)
  }

  const handleClipboardPaste = async () => {
    try {
      const clipboardItems: ClipboardItems = await navigator.clipboard.read()

      if (clipboardItems.length === 0) return
      const [clipboardItem] = clipboardItems
      const { types } = clipboardItem
      const imageType: string | undefined = types.find((type) => allowedImageTypes.has(type))

      if (!imageType) return
      const blob = await clipboardItem.getType(imageType)
      const extension = imageType.split('/')[1]
      const file = new File([blob], `clipboardImage.${extension}`)

      const uplFile: UploadFile = {
        source: blob.toString(),
        name: file.name,
        size: file.size,
        file
      }

      showSnackbar({ body: t('Uploading image') })
      const image: { url: string; originalFilename?: string } = await handleImageUpload(
        uplFile,
        session()?.access_token || ''
      )
      renderUploadedImage(editor() as Editor, image)
    } catch (error) {
      console.error('[Paste Image Error]:', error)
    }
    return false
  }

  // stage 0: update editor options
  const setupEditor = () => {
    console.log('stage 0: update editor options')
    const options: Partial<EditorOptions> = {
      element: editorElRef()!,
      editorProps: {
        attributes: { class: styles.articleEditor },
        transformPastedHTML: (c: string) => c.replaceAll(/<img.*?>/g, ''),
        handlePaste: () => {
          handleClipboardPaste().then((_) => 0)
        }
      },
      extensions: [
        ...base,
        ...custom,
        ...extended,
        Placeholder.configure({
          placeholder: t('Add a link or click plus to embed media')
        }),
        CharacterCount.configure()
      ],
      onTransaction({ transaction, editor }) {
        if (transaction.docChanged) {
          const html = editor.getHTML()
          html && props.onChange(html)
          const wordCount: number = editor.storage.characterCount.words()
          const charsCount: number = editor.storage.characterCount.characters()
          wordCount && countWords({ words: wordCount, characters: charsCount })
        }
      },
      content: props.initialContent ?? null
    }
    console.log(options)
    setEditorOptions(() => options)
    return options
  }

  // stage 1: create editor options when got author profile
  createEffect(
    on([editorOptions, author], ([opts, a]: [Partial<EditorOptions> | undefined, Author | undefined]) => {
      if (isServer) return
      console.log('stage 1: create editor options when got author profile', { opts, a })
      const noOptions = !opts || Object.keys(opts).length === 0
      noOptions && a && setTimeout(setupEditor, 1)
    })
  )

  const isFigcaptionActive = createEditorTransaction(editor as Accessor<Editor | undefined>, (e) =>
    e?.isActive('figcaption')
  )
  createEffect(() => setIsCommonMarkup(!!isFigcaptionActive()))

  const initializeMenus = () => {
    if (menusInitialized() || !editor()) return
    if (
      blockquoteBubbleMenuRef() &&
      figureBubbleMenuRef() &&
      incutBubbleMenuRef() &&
      floatingMenuRef() &&
      fullBubbleMenuRef()
    ) {
      console.log('stage 3: initialize menus when editor instance is ready')
      const menus = [
        BubbleMenu.configure({
          element: fullBubbleMenuRef()!,
          pluginKey: 'fullBubbleMenu',
          shouldShow: ({ editor: e, state: { selection } }) => {
            const { empty, from, to } = selection
            const hasSelection = !empty && from !== to
            const shouldShow =
              e.view.hasFocus() && hasSelection && !e.isActive('image') && !e.isActive('figure')
            setShouldShowFullBubbleMenu(shouldShow)
            return shouldShow
          },
          tippyOptions: {
            duration: 200,
            placement: 'top'
          }
        }),
        BubbleMenu.configure({
          pluginKey: 'blockquoteBubbleMenu',
          element: blockquoteBubbleMenuRef()!,
          shouldShow: ({ editor: e, state: { selection } }) =>
            e.isFocused && !selection.empty && e.isActive('blockquote'),
          tippyOptions: {
            offset: [0, 0],
            placement: 'top',
            getReferenceClientRect: () => {
              const selectedElement = editor()?.view.dom.querySelector('.has-focus')
              return selectedElement?.getBoundingClientRect() || new DOMRect()
            }
          }
        }),
        BubbleMenu.configure({
          pluginKey: 'figureBubbleMenu',
          element: figureBubbleMenuRef()!,
          shouldShow: ({ editor: e, view }) => view.hasFocus() && e.isActive('figure')
        }),
        BubbleMenu.configure({
          pluginKey: 'incutBubbleMenu',
          element: incutBubbleMenuRef()!,
          shouldShow: ({ editor: e, state: { selection } }) =>
            e.isFocused && !selection.empty && e.isActive('figcaption'),
          tippyOptions: {
            offset: [0, -16],
            placement: 'top',
            getReferenceClientRect: () => {
              const selectedElement = editor()?.view.dom.querySelector('.has-focus')
              return selectedElement?.getBoundingClientRect() || new DOMRect()
            }
          }
        }),
        FloatingMenu.configure({
          element: floatingMenuRef()!,
          pluginKey: 'floatingMenu',
          shouldShow: ({ editor: e, state: { selection } }) => {
            const { $anchor, empty } = selection
            const isRootDepth = $anchor.depth === 1
            if (!(isRootDepth && empty)) return false
            return !(e.isActive('codeBlock') || e.isActive('heading'))
          },
          tippyOptions: {
            placement: 'left'
          }
        })
      ]
      setEditorOptions((prev) => ({ ...prev, extensions: [...(prev.extensions || []), ...menus] }))
      setMenusInitialized(true)
    } else {
      console.error('Some menu references are missing')
    }
  }

  const initializeCollaboration = () => {
    if (!editor()) {
      console.error('Editor is not initialized')
      return
    }

    setEditorOptions((prev: Partial<EditorOptions>) => {
      const extensions = [...(prev.extensions || [])]

      try {
        if (!isCollabMode()) {
          // Remove collaboration extensions and return
          const filteredExtensions = extensions.filter(
            (ext) => ext.name !== 'collaboration' && ext.name !== 'collaborationCursor'
          )
          return { ...prev, extensions: filteredExtensions }
        }

        const docName = `shout-${props.shoutId}`
        const token = session()?.access_token || ''
        const profile = author()

        if (!(token && profile)) {
          throw new Error('Missing authentication data')
        }

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
          console.log(`HocuspocusProvider установлен для ${docName}`)
        }
        extensions.push(
          Collaboration.configure({ document: yDocs[docName] }),
          CollaborationCursor.configure({
            provider: providers[docName],
            user: { name: profile.name, color: uniqolor(profile.slug).color }
          })
        )
      } catch (error) {
        console.error('Error initializing collaboration:', error)
        showSnackbar({ body: t('Failed to initialize collaboration') })
      }
      console.log('collab extensions added:', extensions)
      return { ...prev, extensions }
    })
  }

  const handleFocus = (event: FocusEvent) => {
    console.log('handling focus event', event)
    if (editor()?.isActive('figcaption')) {
      editor()?.commands.focus()
      console.log('active figcaption detected, focusing editor')
    }
  }

  onMount(() => {
    console.log('Editor component mounted')
    editorElRef()?.addEventListener('focus', handleFocus)
    requireAuthentication(() => {
      setTimeout(() => {
        const opts = setupEditor()
        createEditorInstance(opts)
        initializeMenus()
      }, 120)
    }, 'edit')
  })

  // collab mode on/off
  createEffect(on(isCollabMode, (x) => !x && initializeCollaboration(), { defer: true }))

  onCleanup(() => {
    editorElRef()?.removeEventListener('focus', handleFocus)
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

      <FullBubbleMenu
        editor={editor as Accessor<Editor | undefined>}
        ref={setFullBubbleMenuRef}
        shouldShow={shouldShowFullBubbleMenu}
        isCommonMarkup={isCommonMarkup()}
      />
      <BlockquoteBubbleMenu editor={editor() as Editor} ref={setBlockquoteBubbleMenuRef} />
      <FigureBubbleMenu editor={editor() as Editor} ref={setFigureBubbleMenuRef} />
      <IncutBubbleMenu editor={editor() as Editor} ref={setIncutBubbleMenuRef} />
      <EditorFloatingMenu editor={editor() as Editor} ref={setFloatingMenuRef} />
    </>
  )
}
