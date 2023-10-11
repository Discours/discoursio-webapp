import { Show, createMemo, createSignal, Switch, onMount, For, Match, createEffect } from 'solid-js'
import type { Author, Shout, Topic } from '../../../graphql/types.gen'
import { Row1 } from '../../Feed/Row1'
import { Row2 } from '../../Feed/Row2'
import { Row3 } from '../../Feed/Row3'
import { useAuthorsStore } from '../../../stores/zine/authors'
import { loadShouts, useArticlesStore } from '../../../stores/zine/articles'
import { router, useRouter } from '../../../stores/router'
import { restoreScrollPosition, saveScrollPosition } from '../../../utils/scroll'
import { splitToPages } from '../../../utils/splitToPages'
import styles from './Author.module.scss'
import stylesArticle from '../../Article/Article.module.scss'
import { clsx } from 'clsx'
import { AuthorCard } from '../../Author/AuthorCard'
import { apiClient } from '../../../utils/apiClient'
import { Comment } from '../../Article/Comment'
import { useLocalize } from '../../../context/localize'
import { AuthorRatingControl } from '../../Author/AuthorRatingControl'
import { hideModal } from '../../../stores/ui'
import { getPagePath } from '@nanostores/router'

type Props = {
  shouts: Shout[]
  author: Author
  authorSlug: string
}

export const PRERENDERED_ARTICLES_COUNT = 12
const LOAD_MORE_PAGE_SIZE = 9

export const AuthorView = (props: Props) => {
  const { t } = useLocalize()
  const { sortedArticles } = useArticlesStore({ shouts: props.shouts })
  const { authorEntities } = useAuthorsStore({ authors: [props.author] })

  const { page: getPage } = useRouter()
  const author = createMemo(() => authorEntities()[props.authorSlug])
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [isBioExpanded, setIsBioExpanded] = createSignal(false)
  const [followers, setFollowers] = createSignal<Author[]>([])
  const [following, setFollowing] = createSignal<Array<Author | Topic>>([])
  const [showExpandBioControl, setShowExpandBioControl] = createSignal(false)

  const bioContainerRef: { current: HTMLDivElement } = { current: null }
  const bioWrapperRef: { current: HTMLDivElement } = { current: null }
  const fetchSubscriptions = async (): Promise<{ authors: Author[]; topics: Topic[] }> => {
    try {
      const [getAuthors, getTopics] = await Promise.all([
        apiClient.getAuthorFollowingUsers({ slug: props.authorSlug }),
        apiClient.getAuthorFollowingTopics({ slug: props.authorSlug })
      ])
      const authors = getAuthors
      const topics = getTopics
      return { authors, topics }
    } catch (error) {
      console.error('[fetchSubscriptions] :', error)
      throw error
    }
  }

  const checkBioHeight = () => {
    if (bioContainerRef.current) {
      setShowExpandBioControl(bioContainerRef.current.offsetHeight > bioWrapperRef.current.offsetHeight)
    }
  }

  onMount(async () => {
    hideModal()
    try {
      const userSubscribers = await apiClient.getAuthorFollowers({ slug: props.authorSlug })
      setFollowers(userSubscribers)
    } catch (error) {
      console.error('[getAuthorFollowers]', error)
    }

    checkBioHeight()

    if (sortedArticles().length === PRERENDERED_ARTICLES_COUNT) {
      await loadMore()
    }
    const { authors, topics } = await fetchSubscriptions()
    setFollowing([...authors, ...topics])
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
    if (getPage().route === 'authorComments') {
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
    <div class={styles.authorPage}>
      <div class="wide-container">
        <Show when={author()}>
          <div class={styles.authorHeader}>
            <AuthorCard
              author={author()}
              isAuthorPage={true}
              followers={followers()}
              following={following()}
            />
          </div>
        </Show>
        <div class={clsx(styles.groupControls, 'row')}>
          <div class="col-md-16">
            <ul class="view-switcher">
              <li classList={{ 'view-switcher__item--selected': getPage().route === 'author' }}>
                <a href={getPagePath(router, 'author', { slug: props.authorSlug })}>{t('Publications')}</a>
                <span class="view-switcher__counter">{author().stat.shouts}</span>
              </li>
              <li classList={{ 'view-switcher__item--selected': getPage().route === 'authorComments' }}>
                <a href={getPagePath(router, 'authorComments', { slug: props.authorSlug })}>
                  {t('Comments')}
                </a>
                <span class="view-switcher__counter">{author().stat.commented}</span>
              </li>
              <li classList={{ 'view-switcher__item--selected': getPage().route === 'authorAbout' }}>
                <a
                  onClick={() => checkBioHeight()}
                  href={getPagePath(router, 'authorAbout', { slug: props.authorSlug })}
                >
                  {t('Profile')}
                </a>
              </li>
            </ul>
          </div>
          <div class={clsx('col-md-8', styles.additionalControls)}>
            <div class={styles.ratingContainer}>
              {t('Karma')}
              <AuthorRatingControl author={props.author} class={styles.ratingControl} />
            </div>
          </div>
        </div>
      </div>

      <Switch>
        <Match when={getPage().route === 'authorAbout'}>
          <div class="wide-container">
            <div class="row">
              <div class="col-md-20 col-lg-18">
                <div
                  ref={(el) => (bioWrapperRef.current = el)}
                  class={styles.longBio}
                  classList={{ [styles.longBioExpanded]: isBioExpanded() }}
                >
                  <div ref={(el) => (bioContainerRef.current = el)} innerHTML={author().about} />
                </div>

                <Show when={showExpandBioControl()}>
                  <button
                    class={clsx('button button--subscribe-topic', styles.longBioExpandedControl)}
                    onClick={() => setIsBioExpanded(!isBioExpanded())}
                  >
                    {t('Show more')}
                  </button>
                </Show>
              </div>
            </div>
          </div>
        </Match>
        <Match when={getPage().route === 'authorComments'}>
          <div class="wide-container">
            <div class="row">
              <div class="col-md-20 col-lg-18">
                <ul class={stylesArticle.comments}>
                  <For each={commented()}>
                    {(comment) => <Comment comment={comment} class={styles.comment} showArticleLink />}
                  </For>
                </ul>
              </div>
            </div>
          </div>
        </Match>

        <Match when={getPage().route === 'author'}>
          <Show when={sortedArticles().length === 1}>
            <Row1 article={sortedArticles()[0]} noauthor={true} nodate={true} />
          </Show>

          <Show when={sortedArticles().length === 2}>
            <Row2 articles={sortedArticles()} isEqual={true} noauthor={true} nodate={true} />
          </Show>

          <Show when={sortedArticles().length === 3}>
            <Row3 articles={sortedArticles()} noauthor={true} nodate={true} />
          </Show>

          <Show when={sortedArticles().length > 3}>
            <Row1 article={sortedArticles()[0]} noauthor={true} nodate={true} />
            <Row2 articles={sortedArticles().slice(1, 3)} isEqual={true} noauthor={true} />
            <Row1 article={sortedArticles()[3]} noauthor={true} nodate={true} />
            <Row2 articles={sortedArticles().slice(4, 6)} isEqual={true} noauthor={true} />
            <Row1 article={sortedArticles()[6]} noauthor={true} nodate={true} />
            <Row2 articles={sortedArticles().slice(7, 9)} isEqual={true} noauthor={true} />

            <For each={pages()}>
              {(page) => (
                <>
                  <Row1 article={page[0]} noauthor={true} nodate={true} />
                  <Row2 articles={page.slice(1, 3)} isEqual={true} noauthor={true} />
                  <Row1 article={page[3]} noauthor={true} nodate={true} />
                  <Row2 articles={page.slice(4, 6)} isEqual={true} noauthor={true} />
                  <Row1 article={page[6]} noauthor={true} nodate={true} />
                  <Row2 articles={page.slice(7, 9)} isEqual={true} noauthor={true} />
                </>
              )}
            </For>
          </Show>

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
