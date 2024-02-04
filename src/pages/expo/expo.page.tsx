import type { PageProps } from '../types'

import { createEffect, createMemo, on } from 'solid-js'

import { PageLayout } from '../../components/_shared/PageLayout'
import { Topics } from '../../components/Nav/Topics'
import { Expo } from '../../components/Views/Expo'
import { useLocalize } from '../../context/localize'
import { useRouter } from '../../stores/router'
import { LayoutType } from '../types'

export const ExpoPage = (props: PageProps) => {
  const { t } = useLocalize()
  const { page } = useRouter()
  const getLayout = createMemo<LayoutType>(() => page().params.layout as LayoutType)

  const getTitle = () => {
    switch (getLayout()) {
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
  }

  createEffect(
    on(
      () => getLayout(),
      () => {
        document.title = getTitle()
      },
      { defer: true },
    ),
  )

  return (
    <PageLayout withPadding={true} zeroBottomPadding={true} title={getTitle()}>
      <Topics />
      <Expo shouts={props.expoShouts} layout={getLayout()} />
    </PageLayout>
  )
}

export const Page = ExpoPage
