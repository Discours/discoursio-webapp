import { createEffect, createMemo, createSignal, onMount, Show, Suspense } from 'solid-js'
import { FullArticle } from '../Article/FullArticle'
import { t } from '../../utils/intl'
import type { Shout, Reaction } from '../../graphql/types.gen'
import { useReactionsStore } from '../../stores/zine/reactions'

interface ArticlePageProps {
  article: Shout
  reactions?: Reaction[]
}

export const ArticleView = (props: ArticlePageProps) => {
  onMount(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://ackee.discours.io/increment.js'
    script.dataset.ackeeServer = 'https://ackee.discours.io'
    script.dataset.ackeeDomainId = '1004abeb-89b2-4e85-ad97-74f8d2c8ed2d'
    document.body.appendChild(script)
  })

  return (
    <Show fallback={<div class="center">{t('Loading')}</div>} when={props.article}>
      <Suspense>
        <FullArticle article={props.article} />
      </Suspense>
    </Show>
  )
}
