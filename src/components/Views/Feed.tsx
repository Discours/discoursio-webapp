import { createMemo, For, Show } from 'solid-js'
import type { Shout, Reaction } from '../../graphql/types.gen'
import '../../styles/Feed.scss'
import Icon from '../Nav/Icon'
import { byCreated, sortBy } from '../../utils/sortby'
import { TopicCard } from '../Topic/Card'
import { ArticleCard } from '../Feed/Card'
import { AuthorCard } from '../Author/Card'
import { t } from '../../utils/intl'
import { useStore } from '@nanostores/solid'
import { FeedSidebar } from '../Feed/Sidebar'
import { session } from '../../stores/auth'
import CommentCard from '../Article/Comment'
import { loadRecentArticles, useArticlesStore } from '../../stores/zine/articles'
import { useReactionsStore } from '../../stores/zine/reactions'
import { useAuthorsStore } from '../../stores/zine/authors'
import { useTopicsStore } from '../../stores/zine/topics'
import { useTopAuthorsStore } from '../../stores/zine/topAuthors'

interface FeedProps {
  articles: Shout[]
  reactions?: Reaction[]
}

// const AUTHORSHIP_REACTIONS = [
//   ReactionKind.Accept,
//   ReactionKind.Reject,
//   ReactionKind.Propose,
//   ReactionKind.Ask
// ]

export const FeedView = (props: FeedProps) => {
  // state
  const { getSortedArticles: articles } = useArticlesStore({ sortedArticles: props.articles })
  const reactions = useReactionsStore()
  const { getSortedAuthors: authors } = useAuthorsStore()
  const { getTopTopics } = useTopicsStore()
  const { getTopAuthors } = useTopAuthorsStore()

  const auth = useStore(session)

  const topReactions = createMemo(() => sortBy(reactions(), byCreated))

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

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const loadMore = () => {
    // const limit = props.limit || 50
    // const offset = props.offset || 0
    // FIXME
    loadRecentArticles({ limit: 50, offset: 0 })
  }
  return (
    <>
      <div class="container feed">
        <div class="row">
          <div class="col-md-3 feed-navigation">
            <FeedSidebar authors={authors()} />
          </div>

          <div class="col-md-6">
            <ul class="feed-filter">
              <Show when={!!auth()?.user?.slug}>
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

            <Show when={articles().length > 0}>
              <For each={articles().slice(0, 4)}>
                {(article) => <ArticleCard article={article} settings={{ isFeedMode: true }} />}
              </For>

              <div class="beside-column-title">
                <h4>{t('Popular authors')}</h4>
                <a href="/user/list">
                  {t('All authors')}
                  <Icon name="arrow-right" />
                </a>
              </div>

              <ul class="beside-column">
                <For each={getTopAuthors().slice(0, 5)}>
                  {(author) => (
                    <li>
                      <AuthorCard author={author} compact={true} hasLink={true} />
                    </li>
                  )}
                </For>
              </ul>

              <For each={articles().slice(4)}>
                {(article) => <ArticleCard article={article} settings={{ isFeedMode: true }} />}
              </For>
            </Show>

            <p class="load-more-container">
              <button class="button">{t('Load more')}</button>
            </p>
          </div>

          <aside class="col-md-3">
            <section class="feed-comments">
              <h4>{t('Comments')}</h4>
              <For each={topReactions()}>
                {(comment) => <CommentCard comment={comment} compact={true} />}
              </For>
            </section>
            <Show when={getTopTopics().length > 0}>
              <section class="feed-topics">
                <h4>{t('Topics')}</h4>
                <For each={getTopTopics().slice(0, 5)}>
                  {(topic) => <TopicCard topic={topic} subscribeButtonBottom={true} />}
                </For>
              </section>
            </Show>
          </aside>
        </div>

        <p class="load-more-container">
          <button class="button" onClick={loadMore}>
            {t('Load more')}
          </button>
        </p>
      </div>
    </>
  )
}
