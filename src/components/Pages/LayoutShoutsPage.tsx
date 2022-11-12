import { MainWrap } from '../Wrap/MainWrap'
import { LayoutView } from '../Views/LayoutView'
import type { PageProps } from '../types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { resetSortedArticles } from '../../stores/zine/articles'
import { useRouter } from '../../stores/router'
import { loadLayoutShouts } from '../../stores/zine/layouts'
import { Loading } from '../Loading'

const PER_PAGE = 50

export const LayoutShoutsPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.shouts))

  const layout = createMemo(() => {
    const { page: getPage } = useRouter()

    const page = getPage()

    if (page.route !== 'layout') {
      throw new Error('ts guard')
    }

    return page.params.layout
  })

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadLayoutShouts({ layout: layout(), amount: PER_PAGE, offset: 0 })

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <MainWrap>
      <Show when={isLoaded()} fallback={<Loading />}>
        <LayoutView layout={layout()} shouts={props.shouts} />
      </Show>
    </MainWrap>
  )
}

// for lazy loading
export default LayoutShoutsPage
