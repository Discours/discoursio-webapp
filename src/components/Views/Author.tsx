import { Show, createMemo, createSignal, Switch, onMount, For, Match, createEffect } from 'solid-js'
import type { Author, Shout, Topic } from '../../graphql/types.gen'
import { Row1 } from '../Feed/Row1'
import { Row2 } from '../Feed/Row2'
import { AuthorFull } from '../Author/Full'

import { useAuthorsStore } from '../../stores/zine/authors'
import { loadShouts, useArticlesStore } from '../../stores/zine/articles'
import { useRouter } from '../../stores/router'
import { restoreScrollPosition, saveScrollPosition } from '../../utils/scroll'
import { splitToPages } from '../../utils/splitToPages'
import styles from './Author.module.scss'
import stylesArticle from '../Article/Article.module.scss'
import { clsx } from 'clsx'
import Userpic from '../Author/Userpic'
import { Popup } from '../_shared/Popup'
import { AuthorCard } from '../Author/Card'
import { apiClient } from '../../utils/apiClient'
import { Comment } from '../Article/Comment'
import { useLocalize } from '../../context/localize'
import { AuthorRatingControl } from '../Author/AuthorRatingControl'
import { TopicCard } from '../Topic/Card'

type AuthorProps = {
  shouts: Shout[]
  author: Author
  authorSlug: string
}

export type AuthorPageSearchParams = {
  by:
    | ''
    | 'viewed'
    | 'rating'
    | 'commented'
    | 'recent'
    | 'subscribed-authors'
    | 'subscribed-topics'
    | 'followers'
    | 'about'
    | 'popular'
}

export const PRERENDERED_ARTICLES_COUNT = 12
const LOAD_MORE_PAGE_SIZE = 9

export const AuthorView = (props: AuthorProps) => {
  const { t } = useLocalize()
  const { sortedArticles } = useArticlesStore({ shouts: props.shouts })
  const { searchParams, changeSearchParam } = useRouter<AuthorPageSearchParams>()
  const { authorEntities } = useAuthorsStore({ authors: [props.author] })
  const author = authorEntities()[props.authorSlug]
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [followers, setFollowers] = createSignal<Author[]>([])
  const [followingUsers, setFollowingUsers] = createSignal<Author[]>([])
  const [subscribedTopics, setSubscribedTopics] = createSignal<Topic[]>([])

  onMount(async () => {
    try {
      const userSubscribers = await apiClient.getAuthorFollowers({ slug: props.authorSlug })
      setFollowers(userSubscribers)
    } catch (error) {
      console.log('[getAuthorFollowers]', error)
    }

    try {
      const authorSubscriptionsUsers = await apiClient.getAuthorFollowingUsers({ slug: props.authorSlug })
      setFollowingUsers(authorSubscriptionsUsers)
    } catch (error) {
      console.log('[getAuthorFollowingUsers]', error)
    }

    try {
      const authorSubscriptionsTopics = await apiClient.getAuthorFollowingTopics({ slug: props.authorSlug })
      setSubscribedTopics(authorSubscriptionsTopics)
    } catch (error) {
      console.log('[getAuthorFollowing]', error)
    }

    if (!searchParams().by) {
      changeSearchParam('by', 'rating')
    }

    if (sortedArticles().length === PRERENDERED_ARTICLES_COUNT) {
      await loadMore()
    }
  })

  const loadMore = async () => {
    saveScrollPosition()
    const { hasMore } = await loadShouts({
      filters: { author: props.authorSlug },
      limit: LOAD_MORE_PAGE_SIZE,
      offset: sortedArticles().length
    })
    setIsLoadMoreButtonVisible(hasMore)
    restoreScrollPosition()
  }

  // TODO: use title
  // const title = createMemo(() => {
  //   const m = searchParams().by
  //   if (m === 'viewed') return t('Top viewed')
  //   if (m === 'rating') return t('Top rated')
  //   if (m === 'commented') return t('Top discussed')
  //   return t('Top recent')
  // })

  const pages = createMemo<Shout[][]>(() =>
    splitToPages(sortedArticles(), PRERENDERED_ARTICLES_COUNT, LOAD_MORE_PAGE_SIZE)
  )

  const [commented, setCommented] = createSignal([])

  createEffect(async () => {
    if (searchParams().by === 'commented') {
      try {
        const data = await apiClient.getReactionsBy({
          by: { comment: true, createdBy: props.authorSlug }
        })
        setCommented(data)
      } catch (error) {
        console.error('[getReactionsBy comment]', error)
      }
    }
  })

  return (
    <div class="author-page">
      <div class="wide-container">
        <AuthorFull author={author} />
        <div class="row group__controls">
          <div class="col-md-16">
            <ul class="view-switcher">
              <li classList={{ selected: searchParams().by === 'rating' }}>
                <button type="button" onClick={() => changeSearchParam('by', 'rating')}>
                  {t('Publications')}
                </button>
              </li>
              <li classList={{ selected: searchParams().by === 'followers' }}>
                <button type="button" onClick={() => changeSearchParam('by', 'followers')}>
                  {t('Followers')}
                </button>
              </li>
              <li classList={{ selected: searchParams().by === 'subscribed-authors' }}>
                <button type="button" onClick={() => changeSearchParam('by', 'subscribed-authors')}>
                  {t('Author subscriptions')}
                </button>
              </li>
              <li classList={{ selected: searchParams().by === 'subscribed-topics' }}>
                <button type="button" onClick={() => changeSearchParam('by', 'subscribed-topics')}>
                  {t('Topic subscriptions')}
                </button>
              </li>
              <li classList={{ selected: searchParams().by === 'commented' }}>
                <button type="button" onClick={() => changeSearchParam('by', 'commented')}>
                  {t('Comments')}
                </button>
              </li>
              <li classList={{ selected: searchParams().by === 'about' }}>
                <button type="button" onClick={() => changeSearchParam('by', 'about')}>
                  {t('About myself')}
                </button>
              </li>
            </ul>
          </div>
          <div class={clsx('col-md-8', styles.additionalControls)}>
            <Popup
              trigger={
                <div class={styles.subscribers}>
                  <Switch>
                    <Match when={followers().length <= 3}>
                      <For each={followers().slice(0, 3)}>
                        {(f) => <Userpic user={f} class={styles.userpic} />}
                      </For>
                    </Match>
                    <Match when={followers().length > 3}>
                      <For each={followers().slice(0, 2)}>
                        {(f) => <Userpic user={f} class={styles.userpic} />}
                      </For>
                      <div class={clsx(styles.userpic, styles.subscribersCounter)}>
                        {followers().length}
                      </div>
                    </Match>
                  </Switch>
                </div>
              }
              variant="tiny"
            >
              <ul class={clsx('nodash', styles.subscribersList)}>
                <For each={followers()}>
                  {(item: Author) => (
                    <li class={styles.subscriber}>
                      <AuthorCard
                        author={item}
                        isNowrap={true}
                        hideDescription={true}
                        hideFollow={true}
                        hasLink={true}
                      />
                    </li>
                  )}
                </For>
              </ul>
            </Popup>

            <div class={styles.ratingContainer}>
              {t('Karma')}
              <AuthorRatingControl author={props.author} class={styles.ratingControl} />
            </div>
          </div>
        </div>
      </div>

      <Switch
        fallback={
          <div class="wide-container">
            <p>{t('Nothing here yet')}</p>
          </div>
        }
      >
        <Match when={searchParams().by === 'about'}>
          <div class="wide-container">
            <p>{author.bio}</p>
          </div>
        </Match>
        <Match when={searchParams().by === 'commented'}>
          <div class="wide-container">
            <ul class={stylesArticle.comments}>
              <For each={commented()}>{(comment) => <Comment comment={comment} />}</For>
            </ul>
          </div>
        </Match>
        <Match when={searchParams().by === 'subscribed-topics'}>
          <div class="wide-container">
            <div class="row">
              <For each={subscribedTopics()}>
                {(topic) => (
                  <div class="col-md-12 col-lg-8">
                    <TopicCard compact iconButton isTopicInRow topic={topic} />
                  </div>
                )}
              </For>
            </div>
          </div>
        </Match>
        <Match when={searchParams().by === 'followers'}>
          <div class="wide-container">
            <div class="row">
              <For each={followers()}>
                {(follower: Author) => (
                  <div class="col-md-6 col-lg-4">
                    <AuthorCard author={follower} hideWriteButton={true} hasLink={true} />
                  </div>
                )}
              </For>
            </div>
          </div>
        </Match>
        <Match when={searchParams().by === 'subscribed-authors'}>
          <div class="wide-container">
            <div class="row">
              <For each={followingUsers()}>
                {(follower: Author) => (
                  <div class="col-md-6 col-lg-4">
                    <AuthorCard author={follower} hideWriteButton={true} hasLink={true} />
                  </div>
                )}
              </For>
            </div>
          </div>
        </Match>
        <Match when={searchParams().by === 'rating'}>
          <Row1 article={sortedArticles()[0]} />
          <Row2 articles={sortedArticles().slice(1, 3)} isEqual={true} />
          <Row1 article={sortedArticles()[3]} />
          <Row2 articles={sortedArticles().slice(4, 6)} isEqual={true} />
          <Row1 article={sortedArticles()[6]} />
          <Row2 articles={sortedArticles().slice(7, 9)} isEqual={true} />

          <For each={pages()}>
            {(page) => (
              <>
                <Row1 article={page[0]} />
                <Row2 articles={page.slice(1, 3)} isEqual={true} />
                <Row1 article={page[3]} />
                <Row2 articles={page.slice(4, 6)} isEqual={true} />
                <Row1 article={page[6]} />
                <Row2 articles={page.slice(7, 9)} isEqual={true} />
              </>
            )}
          </For>

          <Show when={isLoadMoreButtonVisible()}>
            <p class="load-more-container">
              <button class="button" onClick={loadMore}>
                {t('Load more')}
              </button>
            </p>
          </Show>
        </Match>
      </Switch>
    </div>
  )
}
