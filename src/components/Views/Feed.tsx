import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import '../../styles/Feed.scss'
import stylesBeside from '../../components/Feed/Beside.module.scss'
import { Icon } from '../_shared/Icon'
import { byCreated, sortBy } from '../../utils/sortby'
import { TopicCard } from '../Topic/Card'
import { ArticleCard } from '../Feed/Card'
import { AuthorCard } from '../Author/Card'
import { t } from '../../utils/intl'
import { FeedSidebar } from '../Feed/Sidebar'
import CommentCard from '../Article/Comment'
import { loadShoutsBy, useArticlesStore } from '../../stores/zine/articles'
import { useReactionsStore } from '../../stores/zine/reactions'
import { useAuthorsStore } from '../../stores/zine/authors'
import { useTopicsStore } from '../../stores/zine/topics'
import { useTopAuthorsStore } from '../../stores/zine/topAuthors'
import { useSession } from '../../context/session'

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
  const reactions = useReactionsStore()
  const { sortedAuthors } = useAuthorsStore()
  const { topTopics } = useTopicsStore()
  const { topAuthors } = useTopAuthorsStore()
  const { session } = useSession()

  const topReactions = createMemo(() => sortBy(reactions(), byCreated))

  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  // const expectingFocus = createMemo<Shout[]>(() => {
  //   // 1 co-author notifications needs
  //   // TODO: list of articles where you are co-author
  //   // TODO: preload proposals
  //   // TODO: (maybe?) and changes history
  //   console.debug(reactions().filter((r) => r.kind in AUTHORSHIP_REACTIONS))
  //
  //   // 2 community self-regulating mechanics
  //   // TODO: query all new posts to be rated for publishing
  //   // TODO: query all reactions where user is in authors list
  //   return []
  // })

  const loadMore = async () => {
    const { hasMore } = await loadShoutsBy({
      by: { visibility: 'community' },
      limit: FEED_PAGE_SIZE,
      offset: sortedArticles().length
    })
    setIsLoadMoreButtonVisible(hasMore)
  }

  onMount(() => {
    loadMore()
  })

  return (
    <>
      <div class="container feed">
        <div class="row">
          <div class="col-md-3 feed-navigation">
            <FeedSidebar authors={sortedAuthors()} />
          </div>

          <div class="col-md-6">
            <ul class="feed-filter">
              <Show when={!!session()?.user?.slug}>
                <li class="selected">
                  <a href="/feed/my">{t('My feed')}</a>
                </li>
              </Show>
              <li>
                <a href="?by=views">{t('Most read')}</a>
              </li>
              <li>
                <a href="?by=rating">{t('Top rated')}</a>
              </li>
              <li>
                <a href="?by=comments">{t('Most commented')}</a>
              </li>
            </ul>

            <Show when={sortedArticles().length > 0}>
              <For each={sortedArticles().slice(0, 4)}>
                {(article) => <ArticleCard article={article} settings={{ isFeedMode: true }} />}
              </For>

              <div class={stylesBeside.besideColumnTitle}>
                <h4>{t('Popular authors')}</h4>
                <a href="/user/list">
                  {t('All authors')}
                  <Icon name="arrow-right" />
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

          <aside class="col-md-3">
            <section class="feed-comments">
              <h4>{t('Comments')}</h4>
              <For each={topReactions()}>
                {(comment) => <CommentCard comment={comment} compact={true} />}
              </For>
            </section>
            <Show when={topTopics().length > 0}>
              <section class="feed-topics">
                <h4>{t('Topics')}</h4>
                <For each={topTopics().slice(0, 5)}>
                  {(topic) => <TopicCard topic={topic} subscribeButtonBottom={true} />}
                </For>
              </section>
            </Show>
          </aside>
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
