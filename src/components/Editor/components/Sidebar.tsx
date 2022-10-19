import { For, Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { unwrap } from 'solid-js/store'
import { undo, redo } from 'prosemirror-history'
import { Draft, useState } from '../store/context'
import * as remote from '../remote'
import { isEmpty /*, isInitialized*/ } from '../prosemirror/helpers'
import type { Styled } from './Layout'
import '../styles/Sidebar.scss'
import { t } from '../../../utils/intl'

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

const Keys = (props) => (
  <span>
    <For each={props.keys}>{(k: Element) => <i>{k}</i>}</For>
  </span>
)

export const Sidebar = () => {
  const [isMac, setIsMac] = createSignal(false)
  onMount(() => setIsMac(window?.navigator.platform.includes('Mac')))
  // eslint-disable-next-line unicorn/consistent-function-scoping
  // const isDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches
  const mod = isMac() ? 'Cmd' : 'Ctrl'
  // const alt = isMac() ? 'Cmd' : 'Alt'
  const [store, ctrl] = useState()
  const [lastAction, setLastAction] = createSignal<string | undefined>()
  const toggleTheme = () => {
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
  const onOpenDraft = (draft: Draft) => ctrl.openDraft(unwrap(draft))
  const collabUsers = () => store.collab?.y?.provider.awareness.meta.size ?? 0
  const onUndo = () => undo(editorView().state, editorView().dispatch)
  const onRedo = () => redo(editorView().state, editorView().dispatch)
  const onCopyAllAsMd = () =>
    remote.copyAllAsMarkdown(editorView().state).then(() => setLastAction('copy-md'))
  const onDiscard = () => ctrl.discard()
  const [isHidden, setIsHidden] = createSignal<boolean | false>()
  const toggleSidebar = () => setIsHidden(!isHidden())
  toggleSidebar()

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const DraftLink = (p: { draft: Draft }) => {
    const length = 100
    let content = ''
    const getContent = (node: any) => {
      if (node.text) content += node.text
      if (content.length > length) {
        content = content.slice(0, Math.max(0, length)) + '...'
        return content
      }

      if (node.content) {
        for (const child of node.content) {
          if (content.length >= length) break
          content = getContent(child)
        }
      }

      return content
    }

    const text = () =>
      p.draft.path
        ? p.draft.path.slice(Math.max(0, p.draft.path.length - length))
        : getContent(p.draft.text?.doc)

    return (
      // eslint-disable-next-line solid/no-react-specific-props
      <Link className="draft" onClick={() => onOpenDraft(p.draft)} data-testid="open">
        {text()} {p.draft.path && '📎'}
      </Link>
    )
  }

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

      <Off onClick={() => editorView().focus()}>
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
            <Link
              onClick={onDiscard}
              disabled={!store.path && store.drafts.length === 0 && isEmpty(store.text)}
              data-testid="discard"
            >
              {/* eslint-disable-next-line no-nested-ternary */}
              {store.path
                ? 'Close'
                : (store.drafts.length > 0 && isEmpty(store.text)
                ? 'Delete ⚠️'
                : 'Clear')}{' '}
              <Keys keys={[mod, 'w']} />
            </Link>
            <Link onClick={onUndo}>
              Undo <Keys keys={[mod, 'z']} />
            </Link>
            <Link onClick={onRedo}>
              Redo <Keys keys={[mod, ...(isMac() ? ['Shift', 'z'] : ['y'])]} />
            </Link>
            <Link onClick={onToggleMarkdown} data-testid="markdown">
              Markdown mode {store.markdown && '✅'} <Keys keys={[mod, 'm']} />
            </Link>
            <Link onClick={onCopyAllAsMd}>Copy all as MD {lastAction() === 'copy-md' && '📋'}</Link>
            <Show when={store.drafts.length > 0}>
              <h4>Drafts:</h4>
              <p>
                <For each={store.drafts}>{(draft: Draft) => <DraftLink draft={draft} />}</For>
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
