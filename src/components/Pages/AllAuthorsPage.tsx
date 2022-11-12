import { MainWrap } from '../Wrap/MainWrap'
import { AllAuthorsView } from '../Views/AllAuthors'
import type { PageProps } from '../types'
import { createSignal, onMount, Show } from 'solid-js'
import { loadAllAuthors } from '../../stores/zine/authors'
import { Loading } from '../Loading'

export const AllAuthorsPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>(Boolean(props.allAuthors))

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadAllAuthors()
    setIsLoaded(true)
  })

  return (
    <MainWrap>
      <Show when={isLoaded()} fallback={<Loading />}>
        <AllAuthorsView authors={props.allAuthors} />
      </Show>
    </MainWrap>
  )
}

// for lazy loading
export default AllAuthorsPage
