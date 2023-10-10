import { createEffect, createSignal, onMount, Show } from 'solid-js'
import { PageLayout } from '../../components/_shared/PageLayout'
import { Loading } from '../../components/_shared/Loading'
import type { PageProps } from '../types'
import { PRERENDERED_ARTICLES_COUNT } from '../../components/Views/Topic'
import { Expo } from '../../components/Views/Expo'
import { apiClient } from '../../utils/apiClient'
import { Topics } from '../../components/Nav/Topics'

export const ExpoPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>(Boolean(props.expoShouts))

  onMount(async () => {
    if (isLoaded()) {
      return
    }
    // ???
    await apiClient.getShouts({ filters: { excludeLayout: 'article' }, limit: PRERENDERED_ARTICLES_COUNT })
    setIsLoaded(true)
  })

  createEffect(() => {
    if (props.expoShouts) {
      console.log('!!! props.expoShouts:', props.expoShouts)
    }
  })
  return (
    <PageLayout withPadding={true}>
      <Topics />
      <Show when={isLoaded()} fallback={<Loading />}>
        <Expo shouts={props.expoShouts} />
      </Show>
    </PageLayout>
  )
}

export const Page = ExpoPage
