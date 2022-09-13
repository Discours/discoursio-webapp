import { For, Show, createEffect, createSignal, onCleanup } from 'solid-js'
import { unwrap } from 'solid-js/store'
// import { undo, redo } from 'prosemirror-history'
import { File, useState /*, Config, PrettierConfig */ } from './store'
import { clsx } from 'clsx'
import type { Styled } from './Layout'
import './Sidebar.scss'
// import type { EditorState } from 'prosemirror-state'
// import { serialize } from './prosemirror/markdown'
// import { baseUrl } from '../../graphql/client'
// import { isServer } from 'solid-js/web'

// const copy = async (text: string): Promise<void> => navigator.clipboard.writeText(text)
// const copyAllAsMarkdown = async (state: EditorState): Promise<void> =>
//   !isServer && navigator.clipboard.writeText(serialize(state))

const Off = (props: any) => <div class="sidebar-off">{props.children}</div>

const Label = (props: Styled) => <h3 class="sidebar-label">{props.children}</h3>

const Link = (
  props: Styled & { withMargin?: boolean; disabled?: boolean; title?: string; className?: string }
) => (
  <button
    class={clsx('sidebar-link', props.className)}
    style={{ 'margin-bottom': props.withMargin ? '10px' : '' }}
    onClick={props.onClick}
    disabled={props.disabled}
    title={props.title}
    data-testid={props['data-testid']}
  >
    {props.children}
  </button>
)

type FileLinkProps = {
  file: File
  onOpenFile: (file: File) => void
}

const FileLink = (props: FileLinkProps) => {
  const length = 100
  let content = ''
  const getContent = (node: any) => {
    if (node.text) {
      content += node.text
    }

    if (content.length > length) {
      content = `${content.slice(0, Math.max(0, length))}...`

      return content
    }

    if (node.content) {
      for (const child of node.content) {
        if (content.length >= length) {
          break
        }

        content = getContent(child)
      }
    }

    return content
  }

  const text = () =>
    props.file.path
      ? props.file.path.slice(Math.max(0, props.file.path.length - length))
      : getContent(props.file.text?.doc)

  return (
    // eslint-disable-next-line solid/no-react-specific-props
    <Link className="file" onClick={() => props.onOpenFile(props.file)} data-testid="open">
      {text()} {props.file.path && '📎'}
    </Link>
  )
}

export const Sidebar = () => {
  const [store, ctrl] = useState()
  const [lastAction, setLastAction] = createSignal<string | undefined>()
  const toggleTheme = () => {
    document.body.classList.toggle('dark')
    ctrl.updateConfig({ theme: document.body.className })
  }

  // const collabText = () => (store.collab?.started ? 'Stop' : store.collab?.error ? 'Restart 🚨' : 'Start')
  const editorView = () => unwrap(store.editorView)
  // const onToggleMarkdown = () => ctrl.toggleMarkdown()
  const onOpenFile = (file: File) => ctrl.openFile(unwrap(file))
  // const collabUsers = () => store.collab?.y?.provider.awareness.meta.size ?? 0
  // const onUndo = () => undo(editorView().state, editorView().dispatch)
  // const onRedo = () => redo(editorView().state, editorView().dispatch)
  // const onCopyAllAsMd = () => copyAllAsMarkdown(editorView().state).then(() => setLastAction('copy-md'))
  // const onToggleAlwaysOnTop = () => ctrl.updateConfig({ alwaysOnTop: !store.config.alwaysOnTop })
  // const onToggleFullscreen = () => ctrl.setFullscreen(!store.fullscreen)
  // const onNew = () => ctrl.newFile()
  // const onDiscard = () => ctrl.discard()
  const [isHidden, setIsHidden] = createSignal<boolean | false>()

  const toggleSidebar = () => {
    setIsHidden(!isHidden())
  }

  toggleSidebar()

  // const onSaveAs = async () => {
  //   const path = 'test' // TODO: save filename await remote.save(editorView().state)
  //
  //   if (path) ctrl.updatePath(path)
  // }
  //
  // const onCollab = () => {
  //   const state = unwrap(store)
  //
  //   store.collab?.started ? ctrl.stopCollab(state) : console.log(state)
  // }
  //
  // const onOpenInApp = () => {
  //   // if (isTauri) return
  //
  //   if (store.collab?.started) {
  //     window.open(`discoursio://main?room=${store.collab?.room}`, '_self')
  //   } else {
  //     const text = window.btoa(JSON.stringify(editorView().state.toJSON()))
  //
  //     window.open(`discoursio://main?text=${text}`, '_self')
  //   }
  // }
  //
  // const onCopyCollabLink = () => {
  //   copy(`${baseUrl}/collab/${store.collab?.room}`).then(() => {
  //     editorView().focus()
  //     setLastAction('copy-collab-link')
  //   })
  // }
  //
  // const onCopyCollabAppLink = () => {
  //   copy(`discoursio://${store.collab?.room}`).then(() => {
  //     editorView().focus()
  //     setLastAction('copy-collab-app-link')
  //   })
  // }

  // const Keys = (props: { keys: string[] }) => (
  //   <span>
  //     <For each={props.keys}>{(k: string) => <i>{k}</i>}</For>
  //   </span>
  // )

  createEffect(() => {
    setLastAction()
  }, store.lastModified)

  createEffect(() => {
    if (!lastAction()) return

    const id = setTimeout(() => {
      setLastAction()
    }, 1000)

    onCleanup(() => clearTimeout(id))
  })

  return (
    <div class={`sidebar-container${isHidden() ? ' sidebar-container--hidden' : ''}`}>
      <span class="sidebar-opener" onClick={toggleSidebar}>
        Советы и&nbsp;предложения
      </span>

      <Off onClick={() => editorView().focus()} data-tauri-drag-region="true">
        <div class="sidebar-closer" onClick={toggleSidebar} />
        <Show when={true}>
          <div>
            <Show when={store.path}>
              <Label>
                <i>({store.path?.slice(Math.max(0, store.path?.length - 24))})</i>
              </Label>
            </Show>
            <Link>Пригласить соавторов</Link>
            <Link>Настройки публикации</Link>
            <Link>История правок</Link>

            <div class="theme-switcher">
              Ночная тема
              <input type="checkbox" name="theme" id="theme" onClick={toggleTheme} />
              <label for="theme">Ночная тема</label>
            </div>

            {/*
            <Show when={isTauri && !store.path}>
              <Link onClick={onSaveAs}>
                Save to file <Keys keys={[mod, 's']} />
              </Link>
            </Show>
            <Link onClick={onNew} data-testid='new'>
              New <Keys keys={[mod, 'n']} />
            </Link>
            <Link
              onClick={onDiscard}
              disabled={!store.path && store.files?.length === 0 && isEmpty(store.text)}
              data-testid='discard'
            >
              {store.path ? 'Close' : store.files?.length > 0 && isEmpty(store.text) ? 'Delete ⚠️' : 'Clear'}{' '}
              <Keys keys={[mod, 'w']} />
            </Link>
            <Show when={isTauri}>
              <Link onClick={onToggleFullscreen}>
                Fullscreen {store.fullscreen && '✅'} <Keys keys={[alt, 'Enter']} />
              </Link>
            </Show>
            <Link onClick={onUndo}>
              Undo <Keys keys={[mod, 'z']} />
            </Link>
            <Link onClick={onRedo}>
              Redo <Keys keys={[mod, ...(isMac ? ['Shift', 'z'] : ['y'])]} />
            </Link>
            <Show when={isTauri}>
              <Link onClick={onToggleAlwaysOnTop}>Always on Top {store.config.alwaysOnTop && '✅'}</Link>
            </Show>
            <Show when={!isTauri && false}>
              <Link onClick={onOpenInApp}>Open in App ⚡</Link>
            </Show>
            <Link onClick={onToggleMarkdown} data-testid='markdown'>
              Markdown mode {store.markdown && '✅'} <Keys keys={[mod, 'm']} />
            </Link>
            <Link onClick={onCopyAllAsMd}>Copy all as MD {lastAction() === 'copy-md' && '📋'}</Link>
*/}
            <Show when={store.files?.length > 0}>
              <h4>Files:</h4>
              <p>
                <For each={store.files}>{(file) => <FileLink file={file} onOpenFile={onOpenFile} />}</For>
              </p>
            </Show>

            {/*
            <Link onClick={onCollab} title={store.collab?.error ? 'Connection error' : ''}>
              Collab {collabText()}
            </Link>
            <Show when={collabUsers() > 0}>
              <Link onClick={onCopyCollabLink}>
                Copy Link {lastAction() === 'copy-collab-link' && '📋'}
              </Link>
              <Show when={false}>
                <Link onClick={onCopyCollabAppLink}>
                  Copy App Link {lastAction() === 'copy-collab-app-link' && '📋'}
                </Link>
              </Show>
              <span>
                {collabUsers()} {collabUsers() === 1 ? 'user' : 'users'} connected
              </span>
            </Show>

            <Show when={isTauri}>
              <Link onClick={() => remote.quit()}>
                Quit <Keys keys={[mod, 'q']} />
              </Link>
            </Show>
*/}
          </div>
        </Show>
      </Off>
    </div>
  )
}
