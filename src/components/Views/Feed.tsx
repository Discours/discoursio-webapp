import { createEffect, createSignal, For, on, onMount, Show } from 'solid-js'
import { Icon } from '../_shared/Icon'
import { ArticleCard } from '../Feed/ArticleCard'
import { AuthorCard } from '../Author/AuthorCard'
import { Sidebar } from '../Feed/Sidebar'
import { loadShouts, loadMyFeed, useArticlesStore, resetSortedArticles } from '../../stores/zine/articles'
import { useAuthorsStore } from '../../stores/zine/authors'
import { useTopicsStore } from '../../stores/zine/topics'
import { useTopAuthorsStore } from '../../stores/zine/topAuthors'
import { clsx } from 'clsx'
import { useReactions } from '../../context/reactions'
import type { Author, LoadShoutsOptions, Reaction } from '../../graphql/types.gen'
import { getPagePath } from '@nanostores/router'
import { router, useRouter } from '../../stores/router'
import { useLocalize } from '../../context/localize'
import styles from './Feed.module.scss'
import stylesTopic from '../Feed/CardTopic.module.scss'
import stylesBeside from '../../components/Feed/Beside.module.scss'
import { CommentDate } from '../Article/CommentDate'
import { Loading } from '../_shared/Loading'

export const FEED_PAGE_SIZE = 20

type FeedSearchParams = {
  by: 'publish_date' | 'rating' | 'last_comment'
}

const getOrderBy = (by: FeedSearchParams['by']) => {
  if (by === 'rating') {
    return 'rating_stat'
  }

  if (by === 'last_comment') {
    return 'last_comment'
  }

  return ''
}

export const FeedView = () => {
  const { t } = useLocalize()
  const { page, searchParams } = useRouter<FeedSearchParams>()
  const [isLoading, setIsLoading] = createSignal(false)

  // state
  const { sortedArticles } = useArticlesStore()
  const { sortedAuthors } = useAuthorsStore()
  const { topTopics } = useTopicsStore()
  const { topAuthors } = useTopAuthorsStore()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [topComments, setTopComments] = createSignal<Reaction[]>([])

  const {
    actions: { loadReactionsBy }
  } = useReactions()

  createEffect(
    on(
      () => page().route + searchParams().by,
      () => {
        resetSortedArticles()
        loadMore()
      }
    )
  )

  const loadFeedShouts = () => {
    const options: LoadShoutsOptions = {
      limit: FEED_PAGE_SIZE,
      offset: sortedArticles().length
    }

    const orderBy = getOrderBy(searchParams().by)

    if (orderBy) {
      options.order_by = orderBy
    }

    if (page().route === 'feedMy') {
      return loadMyFeed(options)
    }

    // default feed
    return loadShouts({
      ...options,
      filters: { visibility: 'community' }
    })
  }

  const loadMore = async () => {
    setIsLoading(true)
    const { hasMore, newShouts } = await loadFeedShouts()
    setIsLoading(false)

    loadReactionsBy({
      by: {
        shouts: newShouts.map((s) => s.slug)
      }
    })

    setIsLoadMoreButtonVisible(hasMore)
  }

  onMount(async () => {
    // load 5 recent comments overall
    const comments = await loadReactionsBy({ by: { comment: true }, limit: 5 })
    setTopComments(comments)
  })

  return (
    <div>
      <div class="wide-container feed">
        <div class="row">
          <div class={clsx('col-md-5 col-xl-4', styles.feedNavigation)}>
            <Sidebar authors={sortedAuthors()} />
          </div>

          <div class="col-md-12 offset-xl-1">
            <ul class={clsx(styles.feedFilter, 'view-switcher')}>
              <li
                class={clsx({
                  'view-switcher__item--selected':
                    searchParams().by === 'publish_date' || !searchParams().by
                })}
              >
                <a href={getPagePath(router, page().route)}>{t('Recent')}</a>
              </li>
              {/*<li>*/}
              {/*  <a href="/feed/?by=views">{t('Most read')}</a>*/}
              {/*</li>*/}
              <li
                class={clsx({
                  'view-switcher__item--selected': searchParams().by === 'rating'
                })}
              >
                <a href={`${getPagePath(router, page().route)}?by=rating`}>{t('Top rated')}</a>
              </li>
              <li
                class={clsx({
                  'view-switcher__item--selected': searchParams().by === 'last_comment'
                })}
              >
                <a href={`${getPagePath(router, page().route)}?by=last_comment`}>{t('Most commented')}</a>
              </li>
            </ul>

            <Show when={!isLoading()} fallback={<Loading />}>
              <Show when={sortedArticles().length > 0}>
                <For each={sortedArticles().slice(0, 4)}>
                  {(article) => <ArticleCard article={article} settings={{ isFeedMode: true }} />}
                </For>

                <div class={styles.asideSection}>
                  <div class={stylesBeside.besideColumnTitle}>
                    <h4>{t('Popular authors')}</h4>
                    <a href="/authors">
                      {t('All authors')}
                      <Icon name="arrow-right" class={stylesBeside.icon} />
                    </a>
                  </div>

                  <ul class={stylesBeside.besideColumn}>
                    <For each={topAuthors().slice(0, 5)}>
                      {(author) => (
                        <li>
                          <AuthorCard
                            author={author}
                            hideWriteButton={true}
                            hasLink={true}
                            truncateBio={true}
                            isTextButton={true}
                          />
                        </li>
                      )}
                    </For>
                  </ul>
                </div>

                <For each={sortedArticles().slice(4)}>
                  {(article) => <ArticleCard article={article} settings={{ isFeedMode: true }} />}
                </For>
              </Show>

              <Show when={isLoadMoreButtonVisible()}>
                <p class="load-more-container">
                  <button class="button" onClick={loadMore}>
                    {t('Load more')}
                  </button>
                </p>
              </Show>
            </Show>
          </div>

          <aside class={clsx('col-md-7 col-xl-6 offset-xl-1', styles.feedAside)}>
            <section class={styles.asideSection}>
              <h4>{t('Comments')}</h4>
              <For each={topComments()}>
                {(comment) => {
                  return (
                    <div class={styles.comment}>
                      <div class={clsx('text-truncate', styles.commentBody)}>
                        <a
                          href={`${getPagePath(router, 'article', {
                            slug: comment.shout.slug
                          })}?commentId=${comment.id}`}
                          innerHTML={comment.body}
                        />
                      </div>
                      <div class={styles.commentDetails}>
                        <AuthorCard
                          author={comment.createdBy as Author}
                          isFeedMode={true}
                          hideWriteButton={true}
                          hideFollow={true}
                          hasLink={true}
                        />
                        <CommentDate comment={comment} isShort={true} isLastInRow={true} />
                      </div>
                      <div class={clsx('text-truncate', styles.commentArticleTitle)}>
                        <a href={`/${comment.shout.slug}`}>{comment.shout.title}</a>
                      </div>
                    </div>
                  )
                }}
              </For>
            </section>

            <Show when={topTopics().length > 0}>
              <section class={styles.asideSection}>
                <h4>{t('Hot topics')}</h4>
                <For each={topTopics().slice(0, 7)}>
                  {(topic) => (
                    <span class={clsx(stylesTopic.shoutTopic, styles.topic)}>
                      <a href={`/topic/${topic.slug}`}>{topic.title}</a>{' '}
                    </span>
                  )}
                </For>
              </section>
            </Show>

            <section class={clsx(styles.asideSection, styles.pinnedLinks)}>
              <h4>{t('Knowledge base')}</h4>
              <ul class="nodash">
                <li>
                  <a href={getPagePath(router, 'guide')}>Как устроен Дискурс</a>
                </li>
                <li>
                  <a href="/how-to-write-a-good-article">Как создать хороший текст</a>
                </li>
                <li>
                  <a href="#">Правила конструктивных дискуссий</a>
                </li>
                <li>
                  <a href={getPagePath(router, 'principles')}>Принципы сообщества</a>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
