import { A, useLocation, useParams } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Match, Show, Switch, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'
import { Loading } from '~/components/_shared/Loading'
import { useAuthors } from '~/context/authors'
import { useFeed } from '~/context/feed'
import { useFollowing } from '~/context/following'
import { useGraphQL } from '~/context/graphql'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useUI } from '~/context/ui'
import { loadReactions } from '~/graphql/api/public'
import loadShoutsQuery from '~/graphql/query/core/articles-load-by'
import getAuthorFollowersQuery from '~/graphql/query/core/author-followers'
import getAuthorFollowsQuery from '~/graphql/query/core/author-follows'
import type { Author, Reaction, Shout, Topic } from '~/graphql/schema/core.gen'
import { byCreated } from '~/lib/sortby'
import { restoreScrollPosition, saveScrollPosition } from '~/utils/scroll'
import { splitToPages } from '~/utils/splitToPages'
import stylesArticle from '../../Article/Article.module.scss'
import { Comment } from '../../Article/Comment'
import { AuthorCard } from '../../Author/AuthorCard'
import { AuthorShoutsRating } from '../../Author/AuthorShoutsRating'
import { Placeholder } from '../../Feed/Placeholder'
import { Row1 } from '../../Feed/Row1'
import { Row2 } from '../../Feed/Row2'
import { Row3 } from '../../Feed/Row3'
import styles from './Author.module.scss'

type Props = {
  authorSlug: string
  shouts?: Shout[]
  author?: Author
  selectedTab: string
}

export const PRERENDERED_ARTICLES_COUNT = 12
const LOAD_MORE_PAGE_SIZE = 9

export const AuthorView = (props: Props) => {
  const { t } = useLocalize()
  const params = useParams()
  const { followers: myFollowers, follows: myFollows } = useFollowing()
  const { session } = useSession()
  const me = createMemo<Author>(() => session()?.user?.app_data?.profile as Author)
  const [authorSlug, setSlug] = createSignal(props.authorSlug)
  const { sortedFeed } = useFeed()
  const { modal, hideModal } = useUI()
  const loc = useLocation()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [isBioExpanded, setIsBioExpanded] = createSignal(false)
  const { loadAuthor, authorsEntities } = useAuthors()
  const [author, setAuthor] = createSignal<Author>()
  const [followers, setFollowers] = createSignal<Author[]>([] as Author[])
  const [following, changeFollowing] = createSignal<Array<Author | Topic>>([] as Array<Author | Topic>) // flat AuthorFollowsResult
  const [showExpandBioControl, setShowExpandBioControl] = createSignal(false)
  const [commented, setCommented] = createSignal<Reaction[]>([])
  const { query } = useGraphQL()

  // пагинация загрузки ленты постов
  const loadMore = async () => {
    saveScrollPosition()
    const resp = await query(loadShoutsQuery, {
      filters: { author: props.authorSlug },
      limit: LOAD_MORE_PAGE_SIZE,
      offset: sortedFeed().length
    })
    const hasMore = resp?.data?.load_shouts_by?.hasMore
    setIsLoadMoreButtonVisible(hasMore)
    restoreScrollPosition()
  }

  // 1 // проверяет не собственный ли это профиль, иначе - загружает
  const [isFetching, setIsFetching] = createSignal(false)
  createEffect(
    on([() => session()?.user?.app_data?.profile, () => props.authorSlug || ''], async ([me, slug]) => {
      const my = slug && me?.slug === slug
      if (my) {
        console.debug('[Author] my profile precached')
        if (me) {
          setAuthor(me)
          if (myFollowers()) setFollowers((myFollowers() || []) as Author[])
          changeFollowing([...(myFollows?.topics || []), ...(myFollows?.authors || [])])
        }
      } else if (slug && !isFetching()) {
        setIsFetching(true)
        setSlug(slug)
        await loadAuthor({ slug })
        setIsFetching(false) // Сброс состояния загрузки после завершения
      }
    })
  )
  // 3 // after fetch loading following data
  createEffect(
    on(
      [followers, () => authorsEntities()[authorSlug()]],
      async ([current, found]) => {
        if (current) return
        if (!found) return
        setAuthor(found)
        console.info(`[Author] profile for @${authorSlug()} fetched`)
        const followsResp = await query(getAuthorFollowsQuery, { slug: authorSlug() }).toPromise()
        const follows = followsResp?.data?.get_author_followers || {}
        changeFollowing([...(follows?.authors || []), ...(follows?.topics || [])])
        console.info(`[Author] follows for @${authorSlug()} fetched`)
        const followersResp = await query(getAuthorFollowersQuery, { slug: authorSlug() }).toPromise()
        setFollowers(followersResp?.data?.get_author_followers || [])
        console.info(`[Author] followers for @${authorSlug()} fetched`)
        setIsFetching(false)
      },
      { defer: true }
    )
  )

  // догружает ленту и комментарии
  createEffect(
    on(
      () => author() as Author,
      async (profile: Author) => {
        if (!commented() && profile) {
          await loadMore()

          const commentsFetcher = loadReactions({
            by: { comment: true, created_by: profile.id }
          })
          const ccc = await commentsFetcher()
          if (ccc) setCommented((_) => ccc || [])
        }
      }
      // { defer: true },
    )
  )

  let bioContainerRef: HTMLDivElement
  let bioWrapperRef: HTMLDivElement
  const checkBioHeight = () => {
    if (bioContainerRef) {
      setShowExpandBioControl(bioContainerRef.offsetHeight > bioWrapperRef.offsetHeight)
    }
  }

  onMount(() => {
    if (!modal()) hideModal()
    checkBioHeight()
  })

  const pages = createMemo<Shout[][]>(() =>
    splitToPages(sortedFeed(), PRERENDERED_ARTICLES_COUNT, LOAD_MORE_PAGE_SIZE)
  )
  const handleDeleteComment = (id: number) => {
    setCommented((prev) => (prev || []).filter((comment) => comment.id !== id))
  }

  return (
    <div class={styles.authorPage}>
      <div class="wide-container">
        <Show when={author()} fallback={<Loading />}>
          <>
            <div class={styles.authorHeader}>
              <AuthorCard
                author={author() as Author}
                followers={followers() || []}
                flatFollows={following() || []}
              />
            </div>
            <div class={clsx(styles.groupControls, 'row')}>
              <div class="col-md-16">
                <ul class="view-switcher">
                  <li classList={{ 'view-switcher__item--selected': params.tab === '' }}>
                    <A href={`/author/${props.authorSlug}`}>{t('Publications')}</A>
                    <Show when={author()?.stat}>
                      <span class="view-switcher__counter">{author()?.stat?.shouts || 0}</span>
                    </Show>
                  </li>
                  <li classList={{ 'view-switcher__item--selected': params.tab === 'comment' }}>
                    <A href={`/author/${props.authorSlug}/comments`}>{t('Comments')}</A>
                    <Show when={author()?.stat}>
                      <span class="view-switcher__counter">{author()?.stat?.comments || 0}</span>
                    </Show>
                  </li>
                  <li classList={{ 'view-switcher__item--selected': params.tab === 'about' }}>
                    <A onClick={() => checkBioHeight()} href={`/author/${props.authorSlug}/about`}>
                      {t('About the author')}
                    </A>
                  </li>
                </ul>
              </div>
              <div class={clsx('col-md-8', styles.additionalControls)}>
                <Show when={author()?.stat?.rating || author()?.stat?.rating === 0}>
                  <div class={styles.ratingContainer}>
                    {t('All posts rating')}
                    <AuthorShoutsRating author={author() as Author} class={styles.ratingControl} />
                  </div>
                </Show>
              </div>
            </div>
          </>
        </Show>
      </div>

      <Switch>
        <Match when={params.tab === 'about'}>
          <div class="wide-container">
            <div class="row">
              <div class="col-md-20 col-lg-18">
                <div
                  ref={(el) => (bioWrapperRef = el)}
                  class={styles.longBio}
                  classList={{ [styles.longBioExpanded]: isBioExpanded() }}
                >
                  <div ref={(el) => (bioContainerRef = el)} innerHTML={author()?.about || ''} />
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
        <Match when={params.tab === 'comments'}>
          <Show when={me()?.slug === props.authorSlug && !me().stat?.comments}>
            <div class="wide-container">
              <Placeholder type={loc?.pathname} mode="profile" />
            </div>
          </Show>

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
        <Match when={params.tab === ''}>
          <Show when={me()?.slug === props.authorSlug && !me().stat?.shouts}>
            <div class="wide-container">
              <Placeholder type={loc?.pathname} mode="profile" />
            </div>
          </Show>

          <Show when={sortedFeed().length > 0}>
            <Row1 article={sortedFeed()[0]} noauthor={true} nodate={true} />

            <Show when={sortedFeed().length > 1}>
              <Switch>
                <Match when={sortedFeed().length === 2}>
                  <Row2 articles={sortedFeed()} isEqual={true} noauthor={true} nodate={true} />
                </Match>
                <Match when={sortedFeed().length === 3}>
                  <Row3 articles={sortedFeed()} noauthor={true} nodate={true} />
                </Match>
                <Match when={sortedFeed().length > 3}>
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
                </Match>
              </Switch>
            </Show>

            <Show when={isLoadMoreButtonVisible()}>
              <p class="load-more-container">
                <button class="button" onClick={loadMore}>
                  {t('Load more')}
                </button>
              </p>
            </Show>
          </Show>
        </Match>
      </Switch>
    </div>
  )
}
