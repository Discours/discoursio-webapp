import type { PageProps } from '../types'

import { createMemo } from 'solid-js'

import { PageLayout } from '../../components/_shared/PageLayout'
import { Topics } from '../../components/Nav/Topics'
import { Expo } from '../../components/Views/Expo'
import { useLocalize } from '../../context/localize'
import { useRouter } from '../../stores/router'
import { LayoutType } from '../types'

export const ExpoPage = (props: PageProps) => {
  const { t } = useLocalize()
  const { page } = useRouter()
  const getLayout = createMemo<LayoutType>(() => page().params['layout'] as LayoutType)

  const title = createMemo(() => {
    switch (getLayout()) {
      case 'music': {
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

  return (
    <PageLayout withPadding={true} zeroBottomPadding={true} title={title()}>
      <Topics />
      <Expo shouts={props.expoShouts} />
    </PageLayout>
  )
}

export const Page = ExpoPage
