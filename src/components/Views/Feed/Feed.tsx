import { getPagePath } from '@nanostores/router'
import { Meta } from '@solidjs/meta'
import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useReactions } from '../../../context/reactions'
import { useSession } from '../../../context/session'
import { apiClient } from '../../../graphql/client/core'
import type { Author, LoadShoutsOptions, Reaction, Shout } from '../../../graphql/schema/core.gen'
import { router, useRouter } from '../../../stores/router'
import { showModal } from '../../../stores/ui'
import { resetSortedArticles, useArticlesStore } from '../../../stores/zine/articles'
import { useTopAuthorsStore } from '../../../stores/zine/topAuthors'
import { useTopicsStore } from '../../../stores/zine/topics'
import { getImageUrl } from '../../../utils/getImageUrl'
import { byCreated } from '../../../utils/sortby'
import { CommentDate } from '../../Article/CommentDate'
import { getShareUrl } from '../../Article/SharePopup'
import { AuthorBadge } from '../../Author/AuthorBadge'
import { AuthorLink } from '../../Author/AuthorLink'
import { ArticleCard } from '../../Feed/ArticleCard'
import { Sidebar } from '../../Feed/Sidebar'
import { Modal } from '../../Nav/Modal'
import { DropDown } from '../../_shared/DropDown'
import { Icon } from '../../_shared/Icon'
import { InviteMembers } from '../../_shared/InviteMembers'
import { Loading } from '../../_shared/Loading'
import { ShareModal } from '../../_shared/ShareModal'

import stylesBeside from '../../Feed/Beside.module.scss'
import stylesTopic from '../../Feed/CardTopic.module.scss'
import styles from './Feed.module.scss'

export const FEED_PAGE_SIZE = 20
const UNRATED_ARTICLES_COUNT = 5

type FeedPeriod = 'week' | 'month' | 'year'
type VisibilityMode = 'all' | 'community' | 'featured'

type PeriodItem = {
  value: FeedPeriod
  title: string
}

type VisibilityItem = {
  value: VisibilityMode
  title: string
}

type FeedSearchParams = {
  by: 'publish_date' | 'likes' | 'comments'
  period: FeedPeriod
  visibility: VisibilityMode
}

type Props = {
  loadShouts: (options: LoadShoutsOptions) => Promise<{
    hasMore: boolean
    newShouts: Shout[]
  }>
}

const getFromDate = (period: FeedPeriod): number => {
  const now = new Date()
  let d: Date = now
  switch (period) {
    case 'week': {
      d = new Date(now.setDate(now.getDate() - 7))
      break
    }
    case 'month': {
      d = new Date(now.setMonth(now.getMonth() - 1))
      break
    }
    case 'year': {
      d = new Date(now.setFullYear(now.getFullYear() - 1))
      break
    }
  }
  return Math.floor(d.getTime() / 1000)
}

export const FeedView = (props: Props) => {
  const { t } = useLocalize()

  const monthPeriod: PeriodItem = { value: 'month', title: t('This month') }

  const periods: PeriodItem[] = [
    { value: 'week', title: t('This week') },
    monthPeriod,
    { value: 'year', title: t('This year') },
  ]

  const visibilities: VisibilityItem[] = [
    { value: 'community', title: t('All') },
    { value: 'featured', title: t('Published') },
  ]

  const { page, searchParams, changeSearchParams } = useRouter<FeedSearchParams>()
  const [isLoading, setIsLoading] = createSignal(false)
  const [isRightColumnLoaded, setIsRightColumnLoaded] = createSignal(false)
  const { session } = useSession()
  const { loadReactionsBy } = useReactions()
  const { sortedArticles } = useArticlesStore()
  const { topTopics } = useTopicsStore()
  const { topAuthors } = useTopAuthorsStore()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [topComments, setTopComments] = createSignal<Reaction[]>([])
  const [unratedArticles, setUnratedArticles] = createSignal<Shout[]>([])

  const currentPeriod = createMemo(() => {
    const period = periods.find((p) => p.value === searchParams().period)
    if (!period) {
      return monthPeriod
    }
    return period
  })

  const currentVisibility = createMemo(() => {
    const visibility = visibilities.find((v) => v.value === searchParams().visibility)
    if (!visibility) {
      return visibilities[0]
    }
    return visibility
  })

  const loadUnratedArticles = async () => {
    if (session()) {
      const result = await apiClient.getUnratedShouts(UNRATED_ARTICLES_COUNT)
      setUnratedArticles(result)
    }
  }

  const loadTopComments = async () => {
    const comments = await loadReactionsBy({ by: { comment: true }, limit: 50 })
    setTopComments(comments.sort(byCreated).reverse())
  }

  onMount(() => {
    loadMore()
    // eslint-disable-next-line promise/catch-or-return
    Promise.all([loadTopComments()]).finally(() => setIsRightColumnLoaded(true))
  })

  createEffect(() => {
    if (session()?.access_token && !unratedArticles()) {
      loadUnratedArticles()
    }
  })

  createEffect(
    on(
      () => page().route + searchParams().by + searchParams().period + searchParams().visibility,
      () => {
        resetSortedArticles()
        loadMore()
      },
      { defer: true },
    ),
  )

  const loadFeedShouts = () => {
    const options: LoadShoutsOptions = {
      limit: FEED_PAGE_SIZE,
      offset: sortedArticles().length,
    }

    if (searchParams()?.by) {
      options.order_by = searchParams().by
    }

    const visibilityMode = searchParams().visibility

    if (visibilityMode === 'all') {
      options.filters = { ...options.filters }
    } else if (visibilityMode) {
      options.filters = {
        ...options.filters,
        featured: visibilityMode === 'featured',
      }
    }

    if (searchParams().by && searchParams().by !== 'publish_date') {
      const period = searchParams().period || 'month'
      options.filters = { after: getFromDate(period) }
    }

    return props.loadShouts(options)
  }

  const loadMore = async () => {
    setIsLoading(true)
    const { hasMore, newShouts } = await loadFeedShouts()

    setIsLoading(false)

    loadReactionsBy({
      by: {
        shouts: newShouts.map((s) => s.slug),
      },
    })

    setIsLoadMoreButtonVisible(hasMore)
  }

  const ogImage = getImageUrl('production/image/logo_image.png')
  const description = t(
    'Independent media project about culture, science, art and society with horizontal editing',
  )
  const ogTitle = t('Feed')

  const [shareData, setShareData] = createSignal<Shout | undefined>()
  const handleShare = (shared: Shout | undefined) => {
    showModal('share')
    setShareData(shared)
  }

  return (
    <div class="wide-container feed">
      <Meta name="descprition" content={description} />
      <Meta name="keywords" content={t('keywords')} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle} />
      <Meta name="og:image" content={ogImage} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="og:description" content={description} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle} />
      <Meta name="twitter:description" content={description} />
      <div class="row">
        <div class={clsx('col-md-5 col-xl-4', styles.feedNavigation)}>
          <Sidebar />
        </div>

        <div class="col-md-12 offset-xl-1">
          <div class={styles.filtersContainer}>
            <ul class={clsx('view-switcher', styles.feedFilter)}>
              <li
                class={clsx({
                  'view-switcher__item--selected':
                    searchParams().by === 'publish_date' || !searchParams().by,
                })}
              >
                <a href={getPagePath(router, page().route)}>{t('Recent')}</a>
              </li>
              {/*<li>*/}
              {/*  <a href="/feed/?by=views">{t('Most read')}</a>*/}
              {/*</li>*/}
              <li
                class={clsx({
                  'view-switcher__item--selected': searchParams().by === 'likes',
                })}
              >
                <span class="link" onClick={() => changeSearchParams({ by: 'likes' })}>
                  {t('Top rated')}
                </span>
              </li>
              <li
                class={clsx({
                  'view-switcher__item--selected': searchParams().by === 'comments',
                })}
              >
                <span class="link" onClick={() => changeSearchParams({ by: 'comments' })}>
                  {t('Most commented')}
                </span>
              </li>
            </ul>
            <div class={styles.dropdowns}>
              <Show when={searchParams().by && searchParams().by !== 'publish_date'}>
                <DropDown
                  popupProps={{ horizontalAnchor: 'right' }}
                  options={periods}
                  currentOption={currentPeriod()}
                  triggerCssClass={styles.periodSwitcher}
                  onChange={(period: PeriodItem) => changeSearchParams({ period: period.value })}
                />
              </Show>
              <DropDown
                popupProps={{ horizontalAnchor: 'right' }}
                options={visibilities}
                currentOption={currentVisibility()}
                triggerCssClass={styles.periodSwitcher}
                onChange={(visibility: VisibilityItem) =>
                  changeSearchParams({ visibility: visibility.value })
                }
              />
            </div>
          </div>

          <Show when={!isLoading()} fallback={<Loading />}>
            <Show when={sortedArticles().length > 0}>
              <For each={sortedArticles().slice(0, 4)}>
                {(article) => (
                  <ArticleCard
                    onShare={(shared) => handleShare(shared)}
                    onInvite={() => showModal('inviteMembers')}
                    article={article}
                    settings={{ isFeedMode: true }}
                    desktopCoverSize="M"
                  />
                )}
              </For>

              <div class={styles.asideSection}>
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
                        <AuthorBadge author={author} />
                      </li>
                    )}
                  </For>
                </ul>
              </div>

              <For each={sortedArticles().slice(4)}>
                {(article) => (
                  <ArticleCard article={article} settings={{ isFeedMode: true }} desktopCoverSize="M" />
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
          </Show>
        </div>

        <aside class={clsx('col-md-7 col-xl-6 offset-xl-1', styles.feedAside)}>
          <Show when={isRightColumnLoaded()}>
            <Show when={topComments().length > 0}>
              <section class={styles.asideSection}>
                <h4>{t('Comments')}</h4>
                <For each={topComments()}>
                  {(comment) => {
                    return (
                      <div class={styles.comment}>
                        <div class={clsx('text-truncate', styles.commentBody)}>
                          <a
                            href={`${getPagePath(router, 'article', {
                              slug: comment.shout.slug,
                            })}?commentId=${comment.id}`}
                            innerHTML={comment.body}
                          />
                        </div>
                        <div class={styles.commentDetails}>
                          <AuthorLink author={comment.created_by as Author} size={'XS'} />
                          <CommentDate comment={comment} isShort={true} isLastInRow={true} />
                        </div>
                        <div class={clsx('text-truncate', styles.commentArticleTitle)}>
                          <a href={`/${comment.shout.slug}`}>{comment.shout.title}</a>
                        </div>
                      </div>
                    )
                  }}
                </For>
              </section>
            </Show>

            <Show when={topTopics().length > 0}>
              <section class={styles.asideSection}>
                <h4>{t('Hot topics')}</h4>
                <For each={topTopics().slice(0, 7)}>
                  {(topic) => (
                    <span class={clsx(stylesTopic.shoutTopic, styles.topic)}>
                      <a href={`/topic/${topic.slug}`}>{topic.title}</a>{' '}
                    </span>
                  )}
                </For>
              </section>
            </Show>

            <section class={clsx(styles.asideSection, styles.pinnedLinks)}>
              <h4>{t('Knowledge base')}</h4>
              <ul class="nodash">
                <li>
                  <a href={getPagePath(router, 'guide')}>Как устроен Дискурс</a>
                </li>
                <li>
                  <a href="/how-to-write-a-good-article">Как создать хороший текст</a>
                </li>
                <li>
                  <a href="#">Правила конструктивных дискуссий</a>
                </li>
                <li>
                  <a href={getPagePath(router, 'principles')}>Принципы сообщества</a>
                </li>
              </ul>
            </section>
            <Show when={unratedArticles()}>
              <section class={clsx(styles.asideSection)}>
                <h4>{t('Be the first to rate')}</h4>
                <For each={unratedArticles()}>
                  {(article) => (
                    <ArticleCard article={article} settings={{ noimage: true, nodate: true }} />
                  )}
                </For>
              </section>
            </Show>
          </Show>
        </aside>
      </div>
      <Show when={shareData()}>
        <ShareModal
          title={shareData().title}
          description={shareData().description}
          imageUrl={shareData().cover}
          shareUrl={getShareUrl({ pathname: `/${shareData().slug}` })}
        />
      </Show>

      <Modal variant="medium" name="inviteCoauthors">
        <InviteMembers variant={'coauthors'} title={t('Invite experts')} />
      </Modal>
    </div>
  )
}
