import { createEffect, createMemo, createSignal, For, onMount, Show } from 'solid-js'
import '../../styles/Feed.scss'
import stylesBeside from '../../components/Feed/Beside.module.scss'
import { Icon } from '../_shared/Icon'
import { ArticleCard } from '../Feed/Card'
import { AuthorCard } from '../Author/Card'
import { t } from '../../utils/intl'
import { FeedSidebar } from '../Feed/Sidebar'
import { Comment as CommentCard } from '../Article/Comment'
import { loadShouts, useArticlesStore } from '../../stores/zine/articles'
import { useReactionsStore } from '../../stores/zine/reactions'
import { useAuthorsStore } from '../../stores/zine/authors'
import { useTopicsStore } from '../../stores/zine/topics'
import { useTopAuthorsStore } from '../../stores/zine/topAuthors'
import { useSession } from '../../context/session'
import stylesTopic from '../Feed/CardTopic.module.scss'
import styles from './Feed.module.scss'
import { clsx } from 'clsx'

// const AUTHORSHIP_REACTIONS = [
//   ReactionKind.Accept,
//   ReactionKind.Reject,
//   ReactionKind.Propose,
//   ReactionKind.Ask
// ]

export const FEED_PAGE_SIZE = 20

export const FeedView = () => {
  // state
  const { sortedArticles } = useArticlesStore()
  const { sortedReactions: topComments, loadReactionsBy } = useReactionsStore()
  const { sortedAuthors } = useAuthorsStore()
  const { topTopics } = useTopicsStore()
  const { topAuthors } = useTopAuthorsStore()
  const { session } = useSession()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const collaborativeShouts = createMemo(() =>
    sortedArticles().filter((shout) => shout.visibility === 'authors')
  )
  createEffect(async () => {
    if (collaborativeShouts()) {
      // load reactions on collaborativeShouts
      await loadReactionsBy({ by: { shouts: [...collaborativeShouts()] }, limit: 5 })
    }
  })

  const userslug = createMemo(() => session()?.user?.slug)
  createEffect(async () => {
    if (userslug()) {
      // load recent editing shouts ( visibility = authors )
      await loadShouts({ filters: { author: userslug(), visibility: 'authors' }, limit: 15 })
    }
  })

  const loadMore = async () => {
    const { hasMore } = await loadShouts({
      filters: { visibility: 'community' },
      limit: FEED_PAGE_SIZE,
      offset: sortedArticles().length
    })
    setIsLoadMoreButtonVisible(hasMore)
  }

  onMount(async () => {
    // load 5 recent comments overall
    await loadReactionsBy({ by: { comment: true }, limit: 5, offset: 0 })

    // load recent shouts not only published ( visibility = community )
    await loadMore()
  })

  return (
    <>
      <div class="wide-container feed">
        <div class="shift-content">
          <div class={clsx('left-col', styles.feedNavigation)}>
            <FeedSidebar authors={sortedAuthors()} />
          </div>

          <div class="row">
            <div class="col-md-8">
              <ul class="feed-filter">
                <Show when={!!session()?.user?.slug}>
                  <li class="selected">
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
                        <AuthorCard author={author} compact={true} hasLink={true} />
                      </li>
                    )}
                  </For>
                </ul>

                <For each={sortedArticles().slice(4)}>
                  {(article) => <ArticleCard article={article} settings={{ isFeedMode: true }} />}
                </For>
              </Show>
            </div>

            <aside class={clsx('col-md-3', styles.feedAside)}>
              <section class={styles.asideSection}>
                <h4>{t('Comments')}</h4>
                <For each={topComments()}>
                  {/*FIXME: different components/better comment props*/}
                  {(comment) => <CommentCard comment={comment} reactions={[]} compact={true} />}
                </For>
              </section>

              <Show when={topTopics().length > 0}>
                <section class={styles.asideSection}>
                  <h4>{t('Topics')}</h4>
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
                    <a href="/about/guide">Как устроен Дискурс</a>
                  </li>
                  <li>
                    <a href="/how-to-write-a-good-article">Как создать хороший текст</a>
                  </li>
                  <li>
                    <a href="#">Правила конструктивных дискуссий</a>
                  </li>
                  <li>
                    <a href="/about/principles">Принципы сообщества</a>
                  </li>
                </ul>
              </section>
            </aside>
          </div>
        </div>

        <Show when={isLoadMoreButtonVisible()}>
          <p class="load-more-container">
            <button class="button" onClick={loadMore}>
              {t('Load more')}
            </button>
          </p>
        </Show>
      </div>
    </>
  )
}
