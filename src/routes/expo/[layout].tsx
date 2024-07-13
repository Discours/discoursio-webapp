import { Params, RouteSectionProps, createAsync, useParams } from '@solidjs/router'
import { createEffect, createMemo, on } from 'solid-js'
import { TopicsNav } from '~/components/Nav/TopicsNav'
import { Expo } from '~/components/Views/Expo'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'
import { loadShouts } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { LayoutType } from '~/types/common'
import { SHOUTS_PER_PAGE } from '../(main)'

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
    const layouts = params.layout ? [params.layout] : ['audio', 'literature', 'article', 'video', 'image']
    const shoutsLoader = await fetchExpoShouts(layouts)
    return (await shoutsLoader()) as Shout[]
  }
}

export default (props: RouteSectionProps<Shout[]>) => {
  const { t } = useLocalize()
  const params = useParams()
  const shouts = createAsync(
    async () =>
      props.data ||
      (await fetchExpoShouts(
        params.layout ? [params.layout] : ['audio', 'literature', 'article', 'video', 'image']
      ))
  )
  const layout = createMemo(() => params.layout)
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
      <Expo shouts={shouts() || []} layout={layout() as LayoutType} />
    </PageLayout>
  )
}
