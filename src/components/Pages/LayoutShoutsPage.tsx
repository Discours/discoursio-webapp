import { PageWrap } from '../Wraps/PageWrap'
import { LayoutType, LayoutView } from '../Views/LayoutView'
import type { PageProps } from '../types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { resetSortedArticles } from '../../stores/zine/articles'
import { useRouter } from '../../stores/router'
import { loadRecentLayoutShouts } from '../../stores/zine/layouts'
import { Loading } from '../Loading'

const PER_PAGE = 50

export const LayoutShoutsPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.shouts))

  const layout = createMemo<LayoutType>(() => {
    const { page: getPage } = useRouter()

    const page = getPage()

    if (page.route !== 'expo') {
      throw new Error('ts guard')
    }

    return page.params.layout as LayoutType
  })

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadRecentLayoutShouts({ layout: layout(), amount: PER_PAGE, offset: 0 })

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageWrap>
      <Show when={isLoaded()} fallback={<Loading />}>
        <LayoutView layout={layout() as LayoutType} shouts={props.shouts} />
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default LayoutShoutsPage
