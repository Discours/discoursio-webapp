import { For, Show, createEffect, createSignal, onCleanup } from 'solid-js'
import { unwrap } from 'solid-js/store'
import { undo, redo } from 'prosemirror-history'
import { File, useState } from '../store/context'
import { mod } from '../env'
import * as remote from '../remote'
import { isEmpty } from '../prosemirror/helpers'
import { Styled } from './Layout'
import '../styles/Sidebar.scss'

const Off = ({ children }: Styled) => <div class='sidebar-off'>{children}</div>

const Label = (props: Styled) => <h3 class='sidebar-label'>{props.children}</h3>

const Link = (
  props: Styled & { withMargin?: boolean; disabled?: boolean; title?: string; className?: string }
) => (
  <button
    class={`sidebar-link${props.className ? ` ${props.className}` : ''}`}
    style={{ marginBottom: props.withMargin ? '10px' : '' }}
    onClick={props.onClick}
    disabled={props.disabled}
    title={props.title}
    data-testid={props['data-testid']}
  >
    {props.children}
  </button>
)

export const Sidebar = () => {
  const [store, ctrl] = useState()
  const [lastAction, setLastAction] = createSignal<string | undefined>()
  const toggleTheme = () => {
    document.body.classList.toggle('dark')
    ctrl.updateConfig({ theme: document.body.className })
  }
  const collabText = () => (store.collab?.started ? 'Stop' : store.collab?.error ? 'Restart 🚨' : 'Start')
  const editorView = () => unwrap(store.editorView)
  const onToggleMarkdown = () => ctrl.toggleMarkdown()
  const onOpenFile = (file: File) => ctrl.openFile(unwrap(file))
  const collabUsers = () => store.collab?.y?.provider.awareness.meta.size ?? 0
  const onUndo = () => undo(editorView().state, editorView().dispatch)
  const onRedo = () => redo(editorView().state, editorView().dispatch)
  const onCopyAllAsMd = () => remote.copyAllAsMarkdown(editorView().state).then(() => setLastAction('copy-md'))
  const onDiscard = () => ctrl.discard()
  const [isHidden, setIsHidden] = createSignal<boolean | false>()

  const toggleSidebar = () => {
    setIsHidden(!isHidden());
  }

  toggleSidebar();

  const onCollab = () => {
    const state = unwrap(store)
    store.collab?.started ? ctrl.stopCollab(state) : ctrl.startCollab(state)
  }

  const FileLink = (p: { file: File }) => {
    const length = 100
    let content = ''
    const getContent = (node: any) => {
      if (node.text) {
        content += node.text
      }

      if (content.length > length) {
        content = content.substring(0, length) + '...'
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
      p.file.path ? p.file.path.substring(p.file.path.length - length) : getContent(p.file.text?.doc)

    return (
      <Link className='file' onClick={() => onOpenFile(p.file)} data-testid='open'>
        {text()} {p.file.path && '📎'}
      </Link>
    )
  }

  const Keys = ({ keys }: { keys: string[] }) => (
    <span>
      {keys.map((k) => (
        <i>{k}</i>
      ))}
    </span>
  )

  createEffect(() => {
    setLastAction(undefined)
  }, store.lastModified)

  createEffect(() => {
    if (!lastAction()) return
    const id = setTimeout(() => {
      setLastAction(undefined)
    }, 1000)
    onCleanup(() => clearTimeout(id))
  })

  return (
    <div className={'sidebar-container' + (isHidden() ? ' sidebar-container--hidden' : '')}>
      <span className='sidebar-opener' onClick={toggleSidebar}>Советы и&nbsp;предложения</span>

      <Off onClick={() => editorView().focus()}>
        <div className='sidebar-closer' onClick={toggleSidebar}/>
        <Show when={true}>
          <div>
            {store.path && (
              <Label>
                <i>({store.path.substring(store.path.length - 24)})</i>
              </Label>
            )}
            <Link>
              Пригласить соавторов
            </Link>
            <Link>
              Настройки публикации
            </Link>
            <Link>
              История правок
            </Link>

            <div class='theme-switcher'>
              Ночная тема
              <input type='checkbox' name='theme' id='theme' onClick={toggleTheme} />
              <label for='theme'>Ночная тема</label>
            </div>
            <Link
              onClick={onDiscard}
              disabled={!store.path && store.files.length === 0 && isEmpty(store.text)}
              data-testid='discard'
            >
              {store.path ? 'Close' : store.files.length > 0 && isEmpty(store.text) ? 'Delete ⚠️' : 'Clear'}{' '}
              <Keys keys={[mod, 'w']} />
            </Link>
            <Link onClick={onUndo}>
              Undo <Keys keys={[mod, 'z']} />
            </Link>
            <Link onClick={onRedo}>
              Redo <Keys keys={[mod, ...['Shift', 'z']]} />
            </Link>
            <Link onClick={onToggleMarkdown} data-testid='markdown'>
              Markdown mode {store.markdown && '✅'} <Keys keys={[mod, 'm']} />
            </Link>
            <Link onClick={onCopyAllAsMd}>Copy all as MD {lastAction() === 'copy-md' && '📋'}</Link>
            <Show when={store.files.length > 0}>
              <h4>Drafts:</h4>
              <p>
                <For each={store.files}>{(file) => <FileLink file={file} />}</For>
              </p>
            </Show>
            <Link onClick={onCollab} title={store.collab?.error ? 'Connection error' : ''}>
              Collab {collabText()}
            </Link>
            <Show when={collabUsers() > 0}>
              <span>
                {collabUsers()} {collabUsers() === 1 ? 'user' : 'users'} connected
              </span>
            </Show>
          </div>
        </Show>
      </Off>
    </div>
  )
}
