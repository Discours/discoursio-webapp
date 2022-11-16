import { createEffect, createSignal, Show, Suspense } from 'solid-js'
import { FullArticle } from '../Article/FullArticle'
import { t } from '../../utils/intl'
import type { Shout, Reaction } from '../../graphql/types.gen'
import { useReactionsStore } from '../../stores/zine/reactions'

import '../../styles/Article.scss'

interface ArticlePageProps {
  article: Shout
  reactions?: Reaction[]
}

const ARTICLE_COMMENTS_PAGE_SIZE = 50

export const ArticleView = (props: ArticlePageProps) => {
  const [getCommentsPage] = createSignal(1)
  const [getIsCommentsLoading, setIsCommentsLoading] = createSignal(false)
  const {
    reactionsByShout,
    sortedReactions,
    createReaction,
    updateReaction,
    deleteReaction,
    loadReactionsBy
  } = useReactionsStore({ reactions: props.reactions })

  createEffect(async () => {
    try {
      setIsCommentsLoading(true)
      await loadReactionsBy({
        by: { shout: props.article.slug },
        limit: ARTICLE_COMMENTS_PAGE_SIZE,
        offset: getCommentsPage() * ARTICLE_COMMENTS_PAGE_SIZE
      })
    } finally {
      setIsCommentsLoading(false)
    }
  })

  return (
    <div class="article-page">
      <Show fallback={<div class="center">{t('Loading')}</div>} when={props.article}>
        <Suspense>
          <FullArticle
            article={props.article}
            reactions={reactionsByShout()[props.article.slug]}
            isCommentsLoading={getIsCommentsLoading()}
          />
        </Suspense>
      </Show>
    </div>
  )
}
