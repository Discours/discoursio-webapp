import { createEffect, createMemo, For, Show } from 'solid-js'
import { Shout, Topic, Author, Reaction, ReactionKind } from '../../graphql/types.gen'
import '../../styles/Feed.scss'
import Icon from '../Nav/Icon'
import { byCreated, sortBy } from '../../utils/sortby'
import { TopicCard } from '../Topic/Card'
import { ArticleCard } from '../Feed/Card'
import { t } from '../../utils/intl'
import { useStore } from '@nanostores/solid'
import { session } from '../../stores/auth'
import CommentCard from '../Article/Comment'
import { loadRecentArticles, useArticlesStore } from '../../stores/zine/articles'
import { useReactionsStore } from '../../stores/zine/reactions'
import { useAuthorsStore } from '../../stores/zine/authors'
import { FeedSidebar } from '../Feed/Sidebar'

interface FeedProps {
  recentArticles: Shout[]
  reactions: Reaction[]
}

const AUTHORSHIP_REACTIONS = [
  ReactionKind.Accept,
  ReactionKind.Reject,
  ReactionKind.Propose,
  ReactionKind.Ask
]

export const FeedPage = (props: FeedProps) => {
  const [getPage, setPage] = createSignal(1)

  // state
  const { getSortedArticles: articles } = useArticlesStore({ sortedArticles: props.articles })
  const reactions = useReactionsStore(props.reactions)
  const {
    // getAuthorEntities: authorsBySlug,
    getSortedAuthors: authors
  } = useAuthorsStore() // test if it catches preloaded authors
  const auth = useStore(session)

  // derived
  const topReactions = createMemo(() => sortBy(reactions(), byCreated))
  // note this became synthetic

  // methods

  const expectingFocus = createMemo<Shout[]>(() => {
    // 1 co-author notifications needs
    // TODO: list of articles where you are co-author
    // TODO: preload proposals
    // TODO: (maybe?) and changes history
    console.debug(reactions().filter((r) => r.kind in AUTHORSHIP_REACTIONS))

  const loadMore = () => {
    setPage(getPage() + 1)
    //const size = props['size'] || 50
    //const page = (props.page || 1) + 1
    // TODO: loadFeed({ page, size })
  }

  createEffect(() => {
    loadRecentArticles({ page: getPage() })
  })

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

            <Show when={getSortedArticles().length > 0}>
              <For each={getSortedArticles().slice(0, 4)}>
                {(article) => <ArticleCard article={article} settings={{ isFeedMode: true }} />}
              </For>

              <div class="beside-column-title">
                <h4>{t('Popular authors')}</h4>
                <a href="/user/list">
                  {t('All authors')}
                  <Icon name="arrow-right" />
                </a>
              </div>

              {/*FIXME NOW*/}
              {/*<ul class="beside-column">*/}
              {/*  <For each={topAuthors()}>*/}
              {/*    {(author) => (*/}
              {/*      <li>*/}
              {/*        <AuthorCard author={author} compact={true} hasLink={true} />*/}
              {/*      </li>*/}
              {/*    )}*/}
              {/*  </For>*/}
              {/*</ul>*/}

              <For each={getSortedArticles().slice(4)}>
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
              <For each={topReactions() as Reaction[]}>
                {(c: Reaction) => <CommentCard comment={c} compact={true} />}
              </For>
            </section>
            <Show when={getTopTopics().length > 0}>
              <section class="feed-topics">
                <h4>{t('Topics')}</h4>
                <For each={getTopTopics()}>
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
