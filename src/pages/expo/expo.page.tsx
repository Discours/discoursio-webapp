import type { PageProps } from '../types'

import { createEffect, createMemo, on } from 'solid-js'

import { Topics } from '../../components/Nav/Topics'
import { Expo } from '../../components/Views/Expo'
import { PageLayout } from '../../components/_shared/PageLayout'
import { useLocalize } from '../../context/localize'
import { useRouter } from '../../stores/router'
import { LayoutType } from '../types'

export const ExpoPage = (props: PageProps) => {
  const { t } = useLocalize()
  const { page } = useRouter()
  const layout = createMemo(() => page().params['layout'] as LayoutType)
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

  createEffect(on(title, (t) => (document.title = t), { defer: true }))

  return (
    <PageLayout withPadding={true} zeroBottomPadding={true} title={title()}>
      <Topics />
      <Expo shouts={props.expoShouts} layout={layout()} />
    </PageLayout>
  )
}

export const Page = ExpoPage
