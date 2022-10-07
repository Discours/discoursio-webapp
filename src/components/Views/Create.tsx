import { Show, onCleanup, createEffect, onError, onMount, untrack } from 'solid-js'
import { createMutable, unwrap } from 'solid-js/store'
import { State, StateContext, newState } from '../Editor/store'
import { createCtrl } from '../Editor/store/ctrl'
import { Layout } from '../Editor/Layout'
import Editor from '../Editor'
import { Sidebar } from '../Editor/Sidebar'
import ErrorView from '../Editor/Error'
import { getLogger } from '../../utils/logger'

const log = getLogger('CreateView')

export const CreateView = () => {
  const [store, ctrl] = createCtrl(newState())
  const mouseEnterCoords = createMutable({ x: 0, y: 0 })

  const onMouseEnter = (e: MouseEvent) => {
    mouseEnterCoords.x = e.pageX
    mouseEnterCoords.y = e.pageY
  }

  onMount(async () => {
    if (store.error) return
    await ctrl.init()
  })

  onMount(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = '(prefers-color-scheme: dark)'

    window.matchMedia(mediaQuery).addEventListener('change', ctrl.updateTheme)
    onCleanup(() => window.matchMedia(mediaQuery).removeEventListener('change', ctrl.updateTheme))
  })

  onError((error) => {
    console.error('[create] error:', error)
    ctrl.setState({ error: { id: 'exception', props: { error } } })
  })

  createEffect((prev) => {
    const lastModified = store.lastModified
    if (!lastModified || (store.loading === 'initialized' && prev === 'loading')) {
      return store.loading
    }
    const state: State = untrack(() => unwrap(store))
    ctrl.saveState(state)
    return store.loading
  }, store.loading)

  return (
    <StateContext.Provider value={[store, ctrl]}>
      <Layout
        config={store.config}
        data-testid={store.error ? 'error' : store.loading}
        onMouseEnter={onMouseEnter}
      >
        <Show when={store.error}>
          <ErrorView />
        </Show>
        <Show when={store.loading === 'initialized'}>
          <Show when={!store.error}>
            <Editor />
          </Show>
          <Sidebar />
        </Show>
      </Layout>
    </StateContext.Provider>
  )
}
