import { PageWrap } from '../Wraps/PageWrap'
import { AllTopicsView } from '../Views/AllTopics'
import type { PageProps } from '../types'
import { createSignal, onMount, Show } from 'solid-js'
import { loadAllTopics } from '../../stores/zine/topics'
import { Loading } from '../Loading'

export const AllTopicsPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>(Boolean(props.allTopics))

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadAllTopics()
    setIsLoaded(true)
  })

  return (
    <PageWrap>
      <Show when={isLoaded()} fallback={<Loading />}>
        <AllTopicsView topics={props.allTopics} />
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default AllTopicsPage
