import { Params, RouteSectionProps, createAsync } from '@solidjs/router'
import { Show, createEffect, createMemo, on } from 'solid-js'
import { TopicsNav } from '~/components/TopicsNav'
import { Expo } from '~/components/Views/Expo'
import { PageLayout } from '~/components/_shared/PageLayout'
import { EXPO_LAYOUTS, SHOUTS_PER_PAGE } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { loadShouts } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { LayoutType } from '~/types/common'

const fetchExpoShouts = async (layouts: string[]) => {
  const result = await loadShouts({
    filters: { layouts },
    limit: SHOUTS_PER_PAGE,
    offset: 0
  } as LoadShoutsOptions)
  return result || []
}

export const route = {
  load: async ({ params }: { params: Params }) => {
    const layouts = params.layout ? [params.layout] : EXPO_LAYOUTS
    const shoutsLoader = await fetchExpoShouts(layouts)
    return (await shoutsLoader()) as Shout[]
  }
}

export default (props: RouteSectionProps<Shout[]>) => {
  const { t } = useLocalize()
  const shouts = createAsync(
    async () =>
      props.data || (await fetchExpoShouts(props.params.layout ? [props.params.layout] : EXPO_LAYOUTS))
  )
  const layout = createMemo(() => props.params.layout)
  const title = createMemo(() => {
    switch (layout()) {
      case 'audio': {
        return t('Audio')
      }
      case 'video': {
        return t('Video')
      }
      case 'image': {
        return t('Artworks')
      }
      case 'literature': {
        return t('Literature')
      }
      default: {
        return t('Art')
      }
    }
  })

  createEffect(on(title, (ttl) => (document.title = ttl), { defer: true }))

  return (
    <PageLayout withPadding={true} zeroBottomPadding={true} title={`${t('Discours')} :: ${title()}`}>
      <TopicsNav />
      <Show when={shouts()} keyed>
        {(sss) => <Expo shouts={sss} layout={layout() as LayoutType} />}
      </Show>
    </PageLayout>
  )
}
