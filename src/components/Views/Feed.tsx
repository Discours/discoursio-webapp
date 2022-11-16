import { createEffect, createSignal, For, onMount, Show } from 'solid-js'
import '../../styles/Feed.scss'
import stylesBeside from '../../components/Feed/Beside.module.scss'
import { Icon } from '../_shared/Icon'
import { TopicCard } from '../Topic/Card'
import { ArticleCard } from '../Feed/Card'
import { AuthorCard } from '../Author/Card'
import { t } from '../../utils/intl'
import { FeedSidebar } from '../Feed/Sidebar'
import CommentCard from '../Article/Comment'
import { useArticlesStore } from '../../stores/zine/articles'
import { useReactionsStore } from '../../stores/zine/reactions'
import { useAuthorsStore } from '../../stores/zine/authors'
import { useTopicsStore } from '../../stores/zine/topics'
import { useTopAuthorsStore } from '../../stores/zine/topAuthors'
import { useSession } from '../../context/session'
import { Collab, ReactionKind, Shout } from '../../graphql/types.gen'
import { collabs, setCollabs } from '../../stores/editor'

const AUTHORSHIP_REACTIONS = [
  ReactionKind.Accept,
  ReactionKind.Reject,
  ReactionKind.Propose,
  ReactionKind.Ask
]

export const FEED_PAGE_SIZE = 20

export const FeedView = () => {
  // state
  const { sortedArticles, loadShoutsBy } = useArticlesStore()
  const { sortedReactions: topComments, loadReactionsBy } = useReactionsStore({})
  const { sortedAuthors } = useAuthorsStore()
  const { topTopics } = useTopicsStore()
  const { topAuthors } = useTopAuthorsStore()
  const { session } = useSession()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const loadMore = async () => {
    const { hasMore } = await loadShoutsBy({
      by: { visibility: 'community' },
      limit: FEED_PAGE_SIZE,
      offset: sortedArticles().length
    })
    setIsLoadMoreButtonVisible(hasMore)
  }

  onMount(async () => {
    // load 5 recent comments overall
    await loadReactionsBy({ by: {}, limit: 5, offset: 0 })

    // load recent shouts not only published ( visibility = community )
    await loadMore()

    // TODO: load collabs
    // await loadCollabs()

    // load recent editing shouts ( visibility = authors )
    const userslug = session().user.slug
    await loadShoutsBy({ by: { author: userslug, visibility: 'authors' }, limit: 15, offset: 0 })
    const collaborativeShouts = sortedArticles().filter((s: Shout, n: number, arr: Shout[]) => {
      if (s.visibility !== 'authors') {
        arr.splice(n, 1)
        return arr
      }
    })
    // load recent reactions on collabs
    await loadReactionsBy({ by: { shouts: [...collaborativeShouts], body: true }, limit: 5, offset: 0 })
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
              <For each={topComments()}>
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
