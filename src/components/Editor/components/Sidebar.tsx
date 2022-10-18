import { Show, createEffect, createSignal, onCleanup, For } from 'solid-js'
import { unwrap } from 'solid-js/store'
import { undo, redo } from 'prosemirror-history'
import { useState } from '../store'
import type { Styled } from './Layout'

import '../styles/Sidebar.scss'
import { router } from '../../../stores/router'
import { t } from '../../../utils/intl'
import { isEmpty } from '../prosemirror/helpers'
import type { EditorState } from 'prosemirror-state'

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

const mod = 'Ctrl'
const Keys = (props) => (
  <span>
    <For each={props.keys}>{(k: string) => <i>{k}</i>}</For>
  </span>
)

interface SidebarProps {
  error?: string
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export const Sidebar = (_props: SidebarProps) => {
  const [store, ctrl] = useState()
  const [lastAction, setLastAction] = createSignal<string | undefined>()
  const toggleTheme = () => {
    // TODO: use dark/light toggle somewhere
    document.body.classList.toggle('dark')
    ctrl.updateConfig({ theme: document.body.className })
  }
  const collabText = () => {
    if (store.collab?.started) {
      return t('Stop collab')
    } else {
      return store.collab?.error ? t('Restart collab') : t('Start collab')
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
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const onHistory = () => {
    console.log('[editor.sidebar] implement history handling')
    router.open('/create/settings')
  }
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
  const discardText = () => {
    if (store.path) {
      return t('Close')
    } else if (store.drafts.length > 0 && isEmpty(store.text as EditorState)) {
      return t('Delete')
    } else {
      return t('Clear')
    }
  }
  return (
    <div class={'sidebar-container' + (isHidden() ? ' sidebar-container--hidden' : '')}>
      <span class="sidebar-opener" onClick={toggleSidebar}>
        {t('Tips and proposals')}
      </span>

      <Off onClick={() => editorView().focus()}>
        <div class="sidebar-closer" onClick={toggleSidebar} />
        <Show when={true}>
          <div>
            {store.path && (
              <Label>
                <i>({store.path.slice(Math.max(0, store.path.length - 24))})</i>
              </Label>
            )}
            <Link onClick={onNew}>{t('Tabula rasa')}</Link>
            <Link onClick={onCollab}>{t('Invite coauthors')}</Link>
            <Link onClick={() => router.open('/create/settings')}>{t('Publication settings')}</Link>
            <Link onClick={onHistory}>{t('History of changes')}</Link>
            <Link
              onClick={onDiscard}
              disabled={!store.path && store.drafts.length === 0 && isEmpty(store.text as EditorState)}
              data-testid="discard"
            >
              {discardText()} <Keys keys={[mod, 'w']} />
            </Link>
            <Link onClick={onUndo}>
              {t('Undo')} <Keys keys={[mod, 'z']} />
            </Link>
            <Link onClick={onRedo}>
              {t('Redo')} <Keys keys={[mod, 'Shift+z']} />
            </Link>
            <Link onClick={onToggleMarkdown} data-testid="markdown">
              Markdown {store.markdown && '✅'} <Keys keys={[mod, 'm']} />
            </Link>
            <Show when={store.drafts.length > 0}>
              <h4>{t('Drafts')}:</h4>
              <p>
                <For each={store.drafts}>
                  {(draft) => <Link onClick={() => router.open(draft.path)}>{draft.path}</Link>}
                </For>
              </p>
            </Show>

            <Link onClick={onCollab} title={store.collab?.error ? 'Connection error' : ''}>
              {collabText()}
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
