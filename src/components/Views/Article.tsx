import { createEffect, createSignal, Show, Suspense } from 'solid-js'
import { FullArticle } from '../Article/FullArticle'
import { t } from '../../utils/intl'

import type { Shout } from '../../graphql/types.gen'
import { useCurrentArticleStore } from '../../stores/zine/currentArticle'
import { loadArticleReactions, useReactionsStore } from '../../stores/zine/reactions'

import '../../styles/Article.scss'

interface ArticlePageProps {
  article: Shout
}

const ARTICLE_COMMENTS_PAGE_SIZE = 50

export const ArticleView = (props: ArticlePageProps) => {
  const { getCurrentArticle } = useCurrentArticleStore({ currentArticle: props.article })
  const [getCommentsPage] = createSignal(1)
  const [getIsCommentsLoading, setIsCommentsLoading] = createSignal(false)
  const reactionslist = useReactionsStore()

  createEffect(async () => {
    try {
      setIsCommentsLoading(true)
      await loadArticleReactions({
        articleSlug: props.article.slug,
        limit: ARTICLE_COMMENTS_PAGE_SIZE,
        offset: getCommentsPage() * ARTICLE_COMMENTS_PAGE_SIZE
      })
    } finally {
      setIsCommentsLoading(false)
    }
  })

  return (
    <div class="article-page">
      <Show fallback={<div class="center">{t('Loading')}</div>} when={getCurrentArticle()}>
        <Suspense>
          <FullArticle
            article={getCurrentArticle()}
            reactions={reactionslist().filter((r) => r.shout.slug === props.article.slug)}
            isCommentsLoading={getIsCommentsLoading()}
          />
        </Suspense>
      </Show>
    </div>
  )
}
