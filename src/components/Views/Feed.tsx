import { createEffect, createSignal, For, onMount, Show } from 'solid-js'
import { Icon } from '../_shared/Icon'
import { ArticleCard } from '../Feed/ArticleCard'
import { AuthorCard } from '../Author/AuthorCard'
import { Sidebar } from '../Feed/Sidebar'
import { loadShouts, useArticlesStore } from '../../stores/zine/articles'
import { useAuthorsStore } from '../../stores/zine/authors'
import { useTopicsStore } from '../../stores/zine/topics'
import { useTopAuthorsStore } from '../../stores/zine/topAuthors'
import { useSession } from '../../context/session'
import { clsx } from 'clsx'
import { useReactions } from '../../context/reactions'
import type { Author, Reaction } from '../../graphql/types.gen'
import { getPagePath } from '@nanostores/router'
import { router } from '../../stores/router'
import { useLocalize } from '../../context/localize'
import styles from './Feed.module.scss'
import stylesTopic from '../Feed/CardTopic.module.scss'
import stylesBeside from '../../components/Feed/Beside.module.scss'
import { CommentDate } from '../Article/CommentDate'

export const FEED_PAGE_SIZE = 20

export const FeedView = () => {
  const { t } = useLocalize()

  // state
  const { sortedArticles } = useArticlesStore()
  const { sortedAuthors } = useAuthorsStore()
  const { topTopics } = useTopicsStore()
  const { topAuthors } = useTopAuthorsStore()
  const { session, user } = useSession()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [topComments, setTopComments] = createSignal<Reaction[]>([])

  const {
    actions: { loadReactionsBy }
  } = useReactions()

  // TODO:
  // const collaborativeShouts = createMemo(() =>
  //   sortedArticles().filter((shout) => shout.visibility === 'authors')
  // )

  // createEffect(async () => {
  //   if (collaborativeShouts()) {
  //     await loadReactionsBy({ by: { shouts: collaborativeShouts().map((shout) => shout.slug) }, limit: 5 })
  //   }
  // })

  createEffect(async () => {
    if (user()) {
      // load recent editing shouts ( visibility = authors )
      await loadShouts({ filters: { author: user().slug, visibility: 'authors' }, limit: 15 })
    }
  })

  const loadMore = async () => {
    const { hasMore, newShouts } = await loadShouts({
      filters: { visibility: 'community' },
      limit: FEED_PAGE_SIZE,
      offset: sortedArticles().length
    })

    loadReactionsBy({
      by: {
        shouts: newShouts.map((s) => s.slug)
      }
    })

    setIsLoadMoreButtonVisible(hasMore)
  }

  onMount(async () => {
    // load recent shouts not only published ( visibility = community )
    await loadMore()
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
              <Show when={!!session()?.user?.slug}>
                <li class="view-switcher__item--selected">
                  <a href="/feed/my">{t('My feed')}</a>
                </li>
              </Show>
              <li>
                <a href="/feed/?by=views">{t('Most read')}</a>
              </li>
              <li>
                <a href="/feed/?by=rating">{t('Top rated')}</a>
              </li>
              <li>
                <a href="/feed/?by=comments">{t('Most commented')}</a>
              </li>
            </ul>

            <Show when={sortedArticles().length > 0}>
              <For each={sortedArticles().slice(0, 4)}>
                {(article) => <ArticleCard article={article} settings={{ isFeedMode: true }} />}
              </For>

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
                      <AuthorCard author={author} hideWriteButton={true} hasLink={true} />
                    </li>
                  )}
                </For>
              </ul>

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
                <For each={topTopics().slice(0, 5)}>
                  {(topic) => (
                    <span class={clsx(stylesTopic.shoutTopic, styles.topic)}>
                      <a href={`/topic/${topic.slug}`}>{topic.title}</a>{' '}
                    </span>
                  )}
                </For>
              </section>
            </Show>

            <section class={clsx(styles.asideSection, styles.pinnedLinks)}>
              <Icon name="pin" class={styles.icon} />
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
