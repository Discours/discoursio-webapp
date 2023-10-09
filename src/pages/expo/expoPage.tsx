import { createSignal, onMount, Show } from 'solid-js'
import { Title } from '@solidjs/meta'
import { useLocalize } from '../../context/localize'
import { PageLayout } from '../../components/_shared/PageLayout'
import { Loading } from '../../components/_shared/Loading'
import type { PageProps } from '../types'

export const AllAuthorsPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>(Boolean(props.allAuthors))

  const { t } = useLocalize()

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    setIsLoaded(true)
  })

  return (
    <PageLayout>
      <Title>{t('Authors')}</Title>
      <Show when={isLoaded()} fallback={<Loading />}>
        <h1>EXPO</h1>
      </Show>
    </PageLayout>
  )
}

export const ExpoPage = AllAuthorsPage
