import { Show, createEffect, createSignal, onCleanup } from 'solid-js'
import { unwrap } from 'solid-js/store'
import { undo, redo } from 'prosemirror-history'
import { useState } from '../store'
import type { Styled } from './Layout'
import '../styles/Sidebar.scss'

const Off = (props) => <div class="sidebar-off">{props.children}</div>

const Label = (props: Styled) => <h3 class="sidebar-label">{props.children}</h3>

const Link = (
  props: Styled & { withMargin?: boolean; disabled?: boolean; title?: string; className?: string }
) => (
  <button
    class={`sidebar-link${props.className ? ' ' + props.className : ''}`}
    style={{ 'margin-bottom': props.withMargin ? '10px' : '' }}
    onClick={props.onClick}
    disabled={props.disabled}
    title={props.title}
    data-testid={props['data-testid']}
  >
    {props.children}
  </button>
)

// eslint-disable-next-line sonarjs/cognitive-complexity
export const Sidebar = (props) => {
  const [store, ctrl] = useState()
  const [lastAction, setLastAction] = createSignal<string | undefined>()
  const toggleTheme = () => {
    document.body.classList.toggle('dark')
    ctrl.updateConfig({ theme: document.body.className })
  }
  const collabText = () => {
    if (store.collab?.started) {
      return 'Stop collab'
    } else {
      return store.collab?.error ? 'Error collab' : 'Start collab'
    }
  }
  const editorView = () => unwrap(store.editorView)
  const onToggleMarkdown = () => ctrl.toggleMarkdown()
  const collabUsers = () => store.collab?.y?.provider.awareness.meta.size ?? 0
  const onUndo = () => undo(editorView().state, editorView().dispatch)
  const onRedo = () => redo(editorView().state, editorView().dispatch)
  const onNew = () => ctrl.newFile()
  const onDiscard = () => ctrl.discard()
  const [isHidden, setIsHidden] = createSignal<boolean | false>()

  const toggleSidebar = () => setIsHidden(!isHidden())
  toggleSidebar()

  const onCollab = () => {
    const state = unwrap(store)
    store.collab?.started ? ctrl.stopCollab(state) : ctrl.startCollab(state)
  }

  createEffect(() => {
    if (store.lastModified) setLastAction()
  })

  createEffect(() => {
    if (!lastAction()) return
    const id = setTimeout(() => {
      setLastAction()
    }, 1000)
    onCleanup(() => clearTimeout(id))
  })

  return (
    <div class={'sidebar-container' + (isHidden() ? ' sidebar-container--hidden' : '')}>
      <span class="sidebar-opener" onClick={toggleSidebar}>
        Советы и&nbsp;предложения
      </span>

      <Off onClick={() => editorView().focus()} data-tauri-drag-region="true">
        <div class="sidebar-closer" onClick={toggleSidebar} />
        <Show when={true}>
          <div>
            {store.path && (
              <Label>
                <i>({store.path.slice(Math.max(0, store.path.length - 24))})</i>
              </Label>
            )}
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
              disabled={!store.path && store.files.length === 0 && isEmpty(store.text)}
              data-testid='discard'
            >
              {store.path ? 'Close' : store.files.length > 0 && isEmpty(store.text) ? 'Delete ⚠️' : 'Clear'}{' '}
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

            <Show when={store.files.length > 0}>
              <h4>Files:</h4>
              <p>
                <For each={store.files}>{(file) => <FileLink file={file} />}</For>
              </p>
            </Show>


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
*/}
          </div>
        </Show>
      </Off>
    </div>
  )
}
