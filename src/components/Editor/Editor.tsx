import { HocuspocusProvider } from '@hocuspocus/provider'
import { UploadFile } from '@solid-primitives/upload'
import { Editor, EditorOptions } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { FloatingMenu } from '@tiptap/extension-floating-menu'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Show, createEffect, createMemo, createSignal, on, onCleanup, onMount } from 'solid-js'
import { isServer } from 'solid-js/web'
import { createTiptapEditor } from 'solid-tiptap'
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
import { Panel } from './Panel/Panel'
import { BlockquoteBubbleMenu } from './Toolbar/BlockquoteBubbleMenu'
import { EditorFloatingMenu } from './Toolbar/EditorFloatingMenu'
import { FigureBubbleMenu } from './Toolbar/FigureBubbleMenu'
import { IncutBubbleMenu } from './Toolbar/IncutBubbleMenu'
import { TextBubbleMenu } from './Toolbar/TextBubbleMenu'

import './Prosemirror.scss'

export type EditorComponentProps = {
  shoutId: number
  initialContent?: string
  onChange: (text: string) => void
  disableCollaboration?: boolean
}

const yDocs: Record<string, Doc> = {}
const providers: Record<string, HocuspocusProvider> = {}

export const EditorComponent = (props: EditorComponentProps) => {
  const { t } = useLocalize()
  const { session, requireAuthentication } = useSession()
  const author = createMemo<Author>(() => session()?.user?.app_data?.profile as Author)
  const [isCommonMarkup, _setIsCommonMarkup] = createSignal(false)
  const createMenuSignal = () => createSignal(false)
  const [shouldShowTextBubbleMenu, _setShouldShowTextBubbleMenu] = createMenuSignal()
  const [shouldShowBlockquoteBubbleMenu, _setShouldShowBlockquoteBubbleMenu] = createMenuSignal()
  const [shouldShowFigureBubbleMenu, _setShouldShowFigureBubbleMenu] = createMenuSignal()
  const [shouldShowIncutBubbleMenu, _setShouldShowIncutBubbleMenu] = createMenuSignal()
  const [shouldShowFloatingMenu, _setShouldShowFloatingMenu] = createMenuSignal()
  const { showSnackbar } = useSnackbar()
  const { countWords, setEditing } = useEditorContext()
  const [editorOptions, setEditorOptions] = createSignal<Partial<EditorOptions>>({})
  const [editorElRef, setEditorElRef] = createSignal<HTMLElement | undefined>()
  const [textBubbleMenuRef, setTextBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [incutBubbleMenuRef, setIncutBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [figureBubbleMenuRef, setFigureBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [blockquoteBubbleMenuRef, setBlockquoteBubbleMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [floatingMenuRef, setFloatingMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [editor, setEditor] = createSignal<Editor | null>(null)
  const [menusInitialized, setMenusInitialized] = createSignal(false)

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
        attributes: { class: 'articleEditor' },
        transformPastedHTML: (c: string) => c.replaceAll(/<img.*?>/g, ''),
        handlePaste: (_view, _event, _slice) => {
          handleClipboardPaste().then((result) => result)
          return false
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

  // Перенос всех эффектов, зависящих от editor, внутрь onMount
  onMount(() => {
    console.log('Editor component mounted')
    editorElRef()?.addEventListener('focus', handleFocus)
    requireAuthentication(() => {
      setTimeout(() => {
        setupEditor()

        // Создаем экземпляр редактора после монтирования
        createEditorInstance(editorOptions())

        // Инициализируем меню после создания редактора
        if (editor()) {
          initializeMenus()
        }
      }, 1200)
    }, 'edit')
  })

  const initializeMenus = () => {
    if (menusInitialized() || !editor()) return
    if (blockquoteBubbleMenuRef() && figureBubbleMenuRef() && incutBubbleMenuRef() && floatingMenuRef()) {
      console.log('stage 3: initialize menus when editor instance is ready')
      const menuConfigs = [
        { key: 'textBubbleMenu', ref: textBubbleMenuRef, shouldShow: shouldShowTextBubbleMenu },
        {
          key: 'blockquoteBubbleMenu',
          ref: blockquoteBubbleMenuRef,
          shouldShow: shouldShowBlockquoteBubbleMenu
        },
        { key: 'figureBubbleMenu', ref: figureBubbleMenuRef, shouldShow: shouldShowFigureBubbleMenu },
        { key: 'incutBubbleMenu', ref: incutBubbleMenuRef, shouldShow: shouldShowIncutBubbleMenu },
        { key: 'floatingMenu', ref: floatingMenuRef, shouldShow: shouldShowFloatingMenu, isFloating: true }
      ]
      const menus = menuConfigs.map((config) =>
        config.isFloating
          ? FloatingMenu.configure({
              pluginKey: config.key,
              element: config.ref(),
              shouldShow: config.shouldShow
            })
          : BubbleMenu.configure({
              pluginKey: config.key,
              element: config.ref(),
              shouldShow: config.shouldShow
            })
      )
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

    try {
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

      setEditorOptions((prev: Partial<EditorOptions>) => {
        const extensions = [...(prev.extensions || [])]
        if (props.disableCollaboration) {
          // Remove collaboration extensions if they exist
          const filteredExtensions = extensions.filter(
            (ext) => ext.name !== 'collaboration' && ext.name !== 'collaborationCursor'
          )
          return { ...prev, extensions: filteredExtensions }
        }
        extensions.push(
          Collaboration.configure({ document: yDocs[docName] }),
          CollaborationCursor.configure({
            provider: providers[docName],
            user: { name: profile.name, color: uniqolor(profile.slug).color }
          })
        )
        console.log('collab extensions added:', extensions)
        return { ...prev, extensions }
      })
    } catch (error) {
      console.error('Error initializing collaboration:', error)
      showSnackbar({ body: t('Failed to initialize collaboration') })
    }
  }

  const handleFocus = (event: FocusEvent) => {
    console.log('handling focus event', event)
    if (editor()?.isActive('figcaption')) {
      editor()?.commands.focus()
      console.log('active figcaption detected, focusing editor')
    }
  }

  // Инициализируем коллаборацию если необходимо
  createEffect(
    on(
      () => props.disableCollaboration,
      () => {
        initializeCollaboration()
      },
      { defer: true }
    )
  )

  onCleanup(() => {
    editorElRef()?.removeEventListener('focus', handleFocus)
    editor()?.destroy()
  })

  return (
    <>
      <div>
        <Show when={editor()} keyed>
          {(ed: Editor) => (
            <>
              <TextBubbleMenu
                shouldShow={shouldShowTextBubbleMenu()}
                isCommonMarkup={isCommonMarkup()}
                editor={ed}
                ref={setTextBubbleMenuRef}
              />
              <BlockquoteBubbleMenu editor={ed} ref={setBlockquoteBubbleMenuRef} />
              <FigureBubbleMenu editor={ed} ref={setFigureBubbleMenuRef} />
              <IncutBubbleMenu editor={ed} ref={setIncutBubbleMenuRef} />
              <EditorFloatingMenu editor={ed} ref={setFloatingMenuRef} />
            </>
          )}
        </Show>
      </div>

      <div class="row">
        <div class="col-md-5" />
        <div class="col-md-12">
          <div ref={setEditorElRef} id="editorBody" />
        </div>
      </div>

      <Show when={props.shoutId}>
        <Panel shoutId={props.shoutId} />
      </Show>
    </>
  )
}
