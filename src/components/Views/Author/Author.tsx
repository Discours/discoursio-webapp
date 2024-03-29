import type { Author, Reaction, Shout, Topic } from '../../../graphql/schema/core.gen'

import { getPagePath } from '@nanostores/router'
import { Meta, Title } from '@solidjs/meta'
import { clsx } from 'clsx'
import { For, Match, Show, Switch, createEffect, createMemo, createSignal, onMount } from 'solid-js'

import { useFollowing } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { apiClient } from '../../../graphql/client/core'
import { router, useRouter } from '../../../stores/router'
import { loadShouts, useArticlesStore } from '../../../stores/zine/articles'
import { loadAuthor, useAuthorsStore } from '../../../stores/zine/authors'
import { getImageUrl } from '../../../utils/getImageUrl'
import { getDescription } from '../../../utils/meta'
import { restoreScrollPosition, saveScrollPosition } from '../../../utils/scroll'
import { splitToPages } from '../../../utils/splitToPages'
import { Comment } from '../../Article/Comment'
import { AuthorCard } from '../../Author/AuthorCard'
import { AuthorShoutsRating } from '../../Author/AuthorShoutsRating'
import { Row1 } from '../../Feed/Row1'
import { Row2 } from '../../Feed/Row2'
import { Row3 } from '../../Feed/Row3'
import { Loading } from '../../_shared/Loading'

import { MODALS, hideModal } from '../../../stores/ui'
import { byCreated } from '../../../utils/sortby'
import stylesArticle from '../../Article/Article.module.scss'
import styles from './Author.module.scss'

type Props = {
  authorSlug: string
}
export const PRERENDERED_ARTICLES_COUNT = 12
const LOAD_MORE_PAGE_SIZE = 9

export const AuthorView = (props: Props) => {
  const { t } = useLocalize()
  const { loadSubscriptions } = useFollowing()
  const { sortedArticles } = useArticlesStore()
  const { authorEntities } = useAuthorsStore()
  const { page: getPage, searchParams } = useRouter()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [isBioExpanded, setIsBioExpanded] = createSignal(false)
  const [followers, setFollowers] = createSignal<Author[]>([])
  const [following, setFollowing] = createSignal<Array<Author | Topic>>([])
  const [showExpandBioControl, setShowExpandBioControl] = createSignal(false)
  const [commented, setCommented] = createSignal<Reaction[]>()
  const modal = MODALS[searchParams().m]

  // current author
  const [author, setAuthor] = createSignal<Author>()
  createEffect(() => {
    try {
      const a = authorEntities()[props.authorSlug]
      setAuthor(a)
    } catch (error) {
      console.debug(error)
    }
  })

  createEffect(async () => {
    if (author()?.id && !author().stat) {
      const a = await loadAuthor({ slug: '', author_id: author().id })
      console.debug('[AuthorView] loaded author:', a)
    }
  })

  const bioContainerRef: { current: HTMLDivElement } = { current: null }
  const bioWrapperRef: { current: HTMLDivElement } = { current: null }

  const fetchData = async (slug) => {
    try {
      const [subscriptionsResult, followersResult] = await Promise.all([
        apiClient.getAuthorFollows({ slug }),
        apiClient.getAuthorFollowers({ slug }),
      ])

      const { authors, topics } = subscriptionsResult
      setFollowing([...(authors || []), ...(topics || [])])
      setFollowers(followersResult || [])

      console.info('[components.Author] following data loaded')
    } catch (error) {
      console.error('[components.Author] fetch error', error)
    }
  }

  const checkBioHeight = () => {
    if (bioContainerRef.current) {
      setShowExpandBioControl(bioContainerRef.current.offsetHeight > bioWrapperRef.current.offsetHeight)
    }
  }

  onMount(() => {
    fetchData(props.authorSlug)

    if (!modal) {
      hideModal()
    }
  })

  const loadMore = async () => {
    saveScrollPosition()
    const { hasMore } = await loadShouts({
      filters: { author: props.authorSlug },
      limit: LOAD_MORE_PAGE_SIZE,
      offset: sortedArticles().length,
    })
    setIsLoadMoreButtonVisible(hasMore)
    restoreScrollPosition()
  }

  onMount(() => {
    checkBioHeight()

    // pagination
    if (sortedArticles().length === PRERENDERED_ARTICLES_COUNT) {
      loadMore()
      loadSubscriptions()
    }
  })

  const pages = createMemo<Shout[][]>(() =>
    splitToPages(sortedArticles(), PRERENDERED_ARTICLES_COUNT, LOAD_MORE_PAGE_SIZE),
  )

  const fetchComments = async (commenter: Author) => {
    const data = await apiClient.getReactionsBy({
      by: { comment: false, created_by: commenter.id },
    })
    setCommented(data)
  }

  createEffect(() => {
    if (author()) {
      fetchComments(author())
    }
  })

  const ogImage = createMemo(() =>
    author()?.pic
      ? getImageUrl(author()?.pic, { width: 1200 })
      : getImageUrl('production/image/logo_image.png'),
  )
  const description = createMemo(() => getDescription(author()?.bio))
  const handleDeleteComment = (id: number) => {
    setCommented((prev) => prev.filter((comment) => comment.id !== id))
  }

  return (
    <div class={styles.authorPage}>
      <Show when={author()}>
        <Title>{author().name}</Title>
        <Meta name="descprition" content={description()} />
        <Meta name="og:type" content="profile" />
        <Meta name="og:title" content={author().name} />
        <Meta name="og:image" content={ogImage()} />
        <Meta name="og:description" content={description()} />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:title" content={author().name} />
        <Meta name="twitter:description" content={description()} />
        <Meta name="twitter:image" content={ogImage()} />
      </Show>
      <div class="wide-container">
        <Show when={author()} fallback={<Loading />}>
          <>
            <div class={styles.authorHeader}>
              <AuthorCard author={author()} followers={followers()} following={following()} />
            </div>
            <div class={clsx(styles.groupControls, 'row')}>
              <div class="col-md-16">
                <ul class="view-switcher">
                  <li classList={{ 'view-switcher__item--selected': getPage().route === 'author' }}>
                    <a href={getPagePath(router, 'author', { slug: props.authorSlug })}>
                      {t('Publications')}
                    </a>
                    <Show when={author().stat}>
                      <span class="view-switcher__counter">{author().stat.shouts}</span>
                    </Show>
                  </li>
                  <li classList={{ 'view-switcher__item--selected': getPage().route === 'authorComments' }}>
                    <a href={getPagePath(router, 'authorComments', { slug: props.authorSlug })}>
                      {t('Comments')}
                    </a>
                    <Show when={author().stat}>
                      <span class="view-switcher__counter">{author().stat.comments}</span>
                    </Show>
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
                <Show when={author()?.stat?.rating || author()?.stat?.rating === 0}>
                  <div class={styles.ratingContainer}>
                    {t('All posts rating')}
                    <AuthorShoutsRating author={author()} class={styles.ratingControl} />
                  </div>
                </Show>
              </div>
            </div>
          </>
        </Show>
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
                  <For each={commented()?.sort(byCreated).reverse()}>
                    {(comment) => (
                      <Comment
                        comment={comment}
                        class={styles.comment}
                        showArticleLink={true}
                        onDelete={(id) => handleDeleteComment(id)}
                      />
                    )}
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
