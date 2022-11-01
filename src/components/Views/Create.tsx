import { Show, onCleanup, createEffect, onError, onMount, untrack } from 'solid-js'
import { createMutable, unwrap } from 'solid-js/store'
import { State, StateContext, newState } from '../Editor/store/context'
import { createCtrl } from '../Editor/store/actions'
import { Layout } from '../Editor/components/Layout'
import { Editor } from '../Editor/components/Editor'
import { Sidebar } from '../Editor/components/Sidebar'
import ErrorView from '../Editor/components/Error'

const matchDark = () => window.matchMedia('(prefers-color-scheme: dark)')

export const CreateView = () => {
  const onChangeTheme = () => ctrl.updateTheme()
  onMount(() => {
    matchDark().addEventListener('change', onChangeTheme)
    onCleanup(() => matchDark().removeEventListener('change', onChangeTheme))
  })

  const [store, ctrl] = createCtrl(newState())
  const mouseEnterCoords = createMutable({ x: 0, y: 0 })

  const onMouseEnter = (e: MouseEvent) => {
    mouseEnterCoords.x = e.pageX
    mouseEnterCoords.y = e.pageY
  }

  onMount(async () => {
    console.debug('[create] view mounted')
    if (store.error) {
      console.error(store.error)
      return
    }
    await ctrl.init()
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
    console.debug('[create] status update')
    return store.loading
  }, store.loading)

  return (
    <StateContext.Provider value={[store, ctrl]}>
      <Layout
        config={store.config}
        data-testid={store.error ? 'error' : store.loading}
        onMouseEnter={onMouseEnter}
      >
        <Show when={!store.error} fallback={<ErrorView />}>
          <Editor />
          <Sidebar />
        </Show>
      </Layout>
    </StateContext.Provider>
  )
}

export default CreateView
