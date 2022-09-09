import { createSignal, Show, Suspense } from 'solid-js'
import type { Reaction, Shout } from '../../graphql/types.gen'
import { t } from '../../utils/intl'

interface ArticlePageProps {
  article: Shout
  reactions?: Partial<Reaction>[]
}

export const ArticlePage = (props: ArticlePageProps) => {
  const [article] = createSignal<Shout>(props.article)
  return (
    <div class="community-page">
      <Show fallback={<div class="center">{t('Loading')}</div>} when={article()}>
        <Suspense>{t('Community')}</Suspense>
      </Show>
    </div>
  )
}

export default ArticlePage
