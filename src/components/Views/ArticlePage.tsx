import { createEffect, createMemo, createSignal, Show, Suspense } from 'solid-js'
import { FullArticle } from '../Article/FullArticle'
import { t } from '../../utils/intl'

import type { Reaction, Shout } from '../../graphql/types.gen'
import { useCurrentArticleStore } from '../../stores/zine/currentArticle'
import { loadArticleReactions, useReactionsStore } from '../../stores/zine/reactions'

import '../../styles/Article.scss'
import { useStore } from '@nanostores/solid'

interface ArticlePageProps {
  article: Shout
  slug: string
  reactions?: Reaction[]
}

const ARTICLE_COMMENTS_PAGE_SIZE = 50

export const ArticlePage = (props: ArticlePageProps) => {
  const { getCurrentArticle } = useCurrentArticleStore({ currentArticle: props.article })
  const [getCommentsPage] = createSignal(1)
  const [getIsCommentsLoading, setIsCommentsLoading] = createSignal(false)
  const slug = createMemo(() => props.slug)
  const reactionslist = useReactionsStore(props.reactions)

  createEffect(async () => {
    try {
      setIsCommentsLoading(true)
      await loadArticleReactions({
        articleSlug: props.slug,
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
            reactions={reactionslist().filter((r) => r.shout.slug === slug())}
            isCommentsLoading={getIsCommentsLoading()}
          />
        </Suspense>
      </Show>
    </div>
  )
}
