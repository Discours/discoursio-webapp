import { For, Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import type { JSX } from 'solid-js'
import { undo, redo } from 'prosemirror-history'
import { clsx } from 'clsx'
import styles from './Sidebar.module.scss'
import { useOutsideClickHandler } from '../../utils/useOutsideClickHandler'
import { useEscKeyDownHandler } from '../../utils/useEscKeyDownHandler'
import type { EditorView } from 'prosemirror-view'

const Off = (props) => <div class={styles.sidebarOff}>{props.children}</div>

const Link = (props: {
  withMargin?: boolean
  disabled?: boolean
  title?: string
  className?: string
  children: JSX.Element
  onClick?: () => void
}) => (
  <button
    class={clsx(styles.sidebarLink, props.className, {
      [styles.withMargin]: props.withMargin
    })}
    onClick={props.onClick}
    disabled={props.disabled}
    title={props.title}
    data-testid={props['data-testid']}
  >
    {props.children}
  </button>
)

const Keys = (props: { keys: string[] }) => (
  <span>
    <For each={props.keys}>{(k) => <i>{k}</i>}</For>
  </span>
)

type SidebarProps = {
  editorViewRef: {
    current: EditorView
  }
}

export const Sidebar = (props: SidebarProps) => {
  const [lastAction, setLastAction] = createSignal<string | undefined>()

  const { editorViewRef } = props

  const onUndo = () => undo(editorViewRef.current.state, editorViewRef.current.dispatch)
  const onRedo = () => redo(editorViewRef.current.state, editorViewRef.current.dispatch)

  const [isHidden, setIsHidden] = createSignal(true)

  const toggleSidebar = () => {
    setIsHidden((oldIsHidden) => !oldIsHidden)
  }

  createEffect(() => {
    setLastAction()
  })

  createEffect(() => {
    if (!lastAction()) return
    const id = setTimeout(() => {
      setLastAction()
    }, 1000)
    onCleanup(() => clearTimeout(id))
  })

  const [mod, setMod] = createSignal<'Ctrl' | 'Cmd'>('Ctrl')

  onMount(() => {
    setMod(navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl')
  })

  const containerRef: { current: HTMLElement } = {
    current: null
  }

  useEscKeyDownHandler(() => setIsHidden(true))
  useOutsideClickHandler({
    containerRef,
    predicate: () => !isHidden(),
    handler: () => setIsHidden(true)
  })

  return (
    <div
      class={clsx(styles.sidebarContainer, {
        [styles.sidebarContainerHidden]: isHidden()
      })}
      ref={(el) => (containerRef.current = el)}
    >
      <span class={styles.sidebarOpener} onClick={toggleSidebar}>
        Советы и&nbsp;предложения
      </span>

      <Off onClick={() => editorViewRef.current.focus()}>
        <div class={styles.sidebarCloser} onClick={toggleSidebar} />

        <div>
          <Link onClick={onUndo}>
            Undo <Keys keys={[mod(), 'z']} />
          </Link>
          <Link onClick={onRedo}>
            Redo <Keys keys={[mod(), 'Shift', 'z']} />
          </Link>
        </div>
      </Off>
    </div>
  )
}
