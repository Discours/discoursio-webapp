import { A, useLocation, useParams } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Match, Show, Switch, createEffect, createMemo, createSignal } from 'solid-js'
import { Loading } from '~/components/_shared/Loading'
import { coreApiUrl } from '~/config'
import { useAuthors } from '~/context/authors'
import { useFollowing } from '~/context/following'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { graphqlClientCreate } from '~/graphql/client'
import getAuthorFollowersQuery from '~/graphql/query/core/author-followers'
import getAuthorFollowsQuery from '~/graphql/query/core/author-follows'
import type { Author, Reaction, Shout, Topic } from '~/graphql/schema/core.gen'
import { byCreated } from '~/lib/sort'
import stylesArticle from '../../Article/Article.module.scss'
import { Comment } from '../../Article/Comment'
import { AuthorCard } from '../../Author/AuthorCard'
import { AuthorShoutsRating } from '../../Author/AuthorShoutsRating'
import { Placeholder } from '../../Feed/Placeholder'
import { Row1 } from '../../Feed/Row1'
import { Row2 } from '../../Feed/Row2'
import { Row3 } from '../../Feed/Row3'
import styles from './Author.module.scss'

type AuthorViewProps = {
  authorSlug: string
  shouts: Shout[]
  author?: Author
}

export const PRERENDERED_ARTICLES_COUNT = 12
// const LOAD_MORE_PAGE_SIZE = 9

export const AuthorView = (props: AuthorViewProps) => {
  // contexts
  const { t } = useLocalize()
  const loc = useLocation()
  const params = useParams()
  const [currentTab, setCurrentTab] = createSignal<string>(params.tab)

  const { session } = useSession()
  const client = createMemo(() => graphqlClientCreate(coreApiUrl, session()?.access_token))

  const { loadAuthor, authorsEntities } = useAuthors()
  const { followers: myFollowers, follows: myFollows } = useFollowing()

  // signals
  const [isBioExpanded, setIsBioExpanded] = createSignal(false)
  const [author, setAuthor] = createSignal<Author>()
  const [followers, setFollowers] = createSignal<Author[]>([] as Author[])
  const [following, changeFollowing] = createSignal<Array<Author | Topic>>([] as Array<Author | Topic>) // flat AuthorFollowsResult
  const [showExpandBioControl, setShowExpandBioControl] = createSignal(false)
  const [commented, setCommented] = createSignal<Reaction[]>([])

  // derivatives
  const me = createMemo<Author>(() => session()?.user?.app_data?.profile as Author)

  // Переход по табам
  createEffect(() => {
    setCurrentTab(params.tab)
  })

  // Объединенный эффект для загрузки автора и его подписок
  createEffect(async () => {
    const meData = session()?.user?.app_data?.profile as Author
    const slug = props.authorSlug

    if (slug && meData?.slug === slug) {
      setAuthor(meData)
      setFollowers(myFollowers() || [])
      changeFollowing([...(myFollows?.topics || []), ...(myFollows?.authors || [])])
    } else if (slug && !author()) {
      await loadAuthor({ slug })
      const foundAuthor = authorsEntities()[slug]
      setAuthor(foundAuthor)

      if (foundAuthor) {
        const followsResp = await client()
          ?.query(getAuthorFollowsQuery, { slug: foundAuthor.slug })
          .toPromise()
        const follows = followsResp?.data?.get_author_followers || {}
        changeFollowing([...(follows?.authors || []), ...(follows?.topics || [])])

        const followersResp = await client()
          ?.query(getAuthorFollowersQuery, { slug: foundAuthor.slug })
          .toPromise()
        setFollowers(followersResp?.data?.get_author_followers || [])
      }
    }
  })

  // Обработка биографии
  let bioContainerRef: HTMLDivElement
  let bioWrapperRef: HTMLDivElement
  const checkBioHeight = () => {
    if (bioWrapperRef && bioContainerRef) {
      const showExpand = bioContainerRef.offsetHeight > bioWrapperRef.offsetHeight
      setShowExpandBioControl(showExpand)
    }
  }

  createEffect(() => {
    checkBioHeight()
  })

  const handleDeleteComment = (id: number) => {
    setCommented((prev) => prev.filter((comment) => comment.id !== id))
  }

  const TabNavigator = () => (
    <div class="col-md-16">
      <ul class="view-switcher">
        <li classList={{ 'view-switcher__item--selected': !currentTab() }}>
          <A href={`/@${props.authorSlug}`}>{t('Publications')}</A>
          <Show when={author()?.stat}>
            <span class="view-switcher__counter">{author()?.stat?.shouts || 0}</span>
          </Show>
        </li>
        <li classList={{ 'view-switcher__item--selected': currentTab() === 'comments' }}>
          <A href={`/@${props.authorSlug}/comments`}>{t('Comments')}</A>
          <Show when={author()?.stat}>
            <span class="view-switcher__counter">{author()?.stat?.comments || 0}</span>
          </Show>
        </li>
        <li classList={{ 'view-switcher__item--selected': currentTab() === 'about' }}>
          <A onClick={() => checkBioHeight()} href={`/@${props.authorSlug}/about`}>
            {t('About the author')}
          </A>
        </li>
      </ul>
    </div>
  )

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
              <TabNavigator />
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
        <Match when={currentTab() === 'about'}>
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

        <Match when={currentTab() === 'comments'}>
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

        <Match when={!currentTab()}>
          <Show when={me()?.slug === props.authorSlug && !me().stat?.shouts}>
            <div class="wide-container">
              <Placeholder type={loc?.pathname} mode="profile" />
            </div>
          </Show>

          <Show when={Array.isArray(props.shouts) && props.shouts.length > 0}>
            <For each={props.shouts.filter((_, i) => i % 3 === 0)}>
              {(_shout, index) => {
                const articles = props.shouts.slice(index() * 3, index() * 3 + 3)
                return (
                  <>
                    <Switch>
                      <Match when={articles.length === 1}>
                        <Row1 article={articles[0]} noauthor={true} nodate={true} />
                      </Match>
                      <Match when={articles.length === 2}>
                        <Row2 articles={articles} noauthor={true} nodate={true} isEqual={true} />
                      </Match>
                      <Match when={articles.length === 3}>
                        <Row3 articles={articles} noauthor={true} nodate={true} />
                      </Match>
                    </Switch>
                  </>
                )
              }}
            </For>
          </Show>
        </Match>
      </Switch>
    </div>
  )
}
