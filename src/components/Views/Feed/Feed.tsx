import type { Author, LoadShoutsOptions, Reaction, Shout } from '../../../graphql/types.gen'

import { getPagePath } from '@nanostores/router'
import { Meta } from '@solidjs/meta'
import { clsx } from 'clsx'
import { createEffect, createMemo, createSignal, For, on, onMount, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useReactions } from '../../../context/reactions'
import { router, useRouter } from '../../../stores/router'
import { showModal } from '../../../stores/ui'
import { useArticlesStore, resetSortedArticles } from '../../../stores/zine/articles'
import { useTopAuthorsStore } from '../../../stores/zine/topAuthors'
import { useTopicsStore } from '../../../stores/zine/topics'
import { apiClient } from '../../../utils/apiClient'
import { getImageUrl } from '../../../utils/getImageUrl'
import { getServerDate } from '../../../utils/getServerDate'
import { DropDown } from '../../_shared/DropDown'
import { Icon } from '../../_shared/Icon'
import { Loading } from '../../_shared/Loading'
import { ShareModal } from '../../_shared/ShareModal'
import { CommentDate } from '../../Article/CommentDate'
import { getShareUrl } from '../../Article/SharePopup'
import { AuthorLink } from '../../Author/AhtorLink'
import { AuthorBadge } from '../../Author/AuthorBadge'
import { ArticleCard } from '../../Feed/ArticleCard'
import { Sidebar } from '../../Feed/Sidebar'

import styles from './Feed.module.scss'
import stylesBeside from '../../Feed/Beside.module.scss'
import stylesTopic from '../../Feed/CardTopic.module.scss'

export const FEED_PAGE_SIZE = 20
const UNRATED_ARTICLES_COUNT = 5

type FeedPeriod = 'week' | 'month' | 'year'
type VisibilityMode = 'all' | 'community' | 'public'

type ShareData = {
  title: string
  description: string
  image: string
  url: string
}

type PeriodItem = {
  value: FeedPeriod
  title: string
}

type VisibilityItem = {
  value: VisibilityMode
  title: string
}

type FeedSearchParams = {
  by: 'publish_date' | 'rating' | 'last_comment'
  period: FeedPeriod
  visibility: VisibilityMode
}

const getOrderBy = (by: FeedSearchParams['by']) => {
  if (by === 'rating') {
    return 'rating_stat'
  }

  if (by === 'last_comment') {
    return 'last_comment'
  }

  return ''
}

const getFromDate = (period: FeedPeriod): Date => {
  const now = new Date()
  switch (period) {
    case 'week': {
      return new Date(now.setDate(now.getDate() - 7))
    }
    case 'month': {
      return new Date(now.setMonth(now.getMonth() - 1))
    }
    case 'year': {
      return new Date(now.setFullYear(now.getFullYear() - 1))
    }
  }
}

type Props = {
  loadShouts: (options: LoadShoutsOptions) => Promise<{
    hasMore: boolean
    newShouts: Shout[]
  }>
}

export const Feed = (props: Props) => {
  const { t } = useLocalize()

  const monthPeriod: PeriodItem = { value: 'month', title: t('This month') }
  const visibilityAll = { value: 'public', title: t('All') }

  const periods: PeriodItem[] = [
    { value: 'week', title: t('This week') },
    monthPeriod,
    { value: 'year', title: t('This year') },
  ]

  const visibilities: VisibilityItem[] = [
    { value: 'community', title: t('All') },
    { value: 'public', title: t('Published') },
  ]

  const { page, searchParams, changeSearchParams } = useRouter<FeedSearchParams>()
  const [isLoading, setIsLoading] = createSignal(false)
  const [isRightColumnLoaded, setIsRightColumnLoaded] = createSignal(false)

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
      return visibilityAll
    }
    return visibility
  })

  const {
    actions: { loadReactionsBy },
  } = useReactions()

  const loadUnratedArticles = async () => {
    const result = await apiClient.getUnratedShouts(UNRATED_ARTICLES_COUNT)
    setUnratedArticles(result)
  }

  const loadTopComments = async () => {
    const comments = await loadReactionsBy({ by: { comment: true }, limit: 5 })
    setTopComments(comments)
  }

  onMount(() => {
    loadMore()
    // eslint-disable-next-line promise/catch-or-return
    Promise.all([loadUnratedArticles(), loadTopComments()]).finally(() => setIsRightColumnLoaded(true))
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

    const orderBy = getOrderBy(searchParams().by)
    if (orderBy) {
      options.order_by = orderBy
    }

    const visibilityMode = searchParams().visibility
    if (visibilityMode && visibilityMode !== 'all') {
      options.filters = { ...options.filters, visibility: visibilityMode }
    }

    if (searchParams().by && searchParams().by !== 'publish_date') {
      const period = searchParams().period || 'month'
      const fromDate = getFromDate(period)
      options.filters = { ...options.filters, fromDate: getServerDate(fromDate) }
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

  const [shareData, setShareData] = createSignal<ShareData | undefined>()
  const handleShare = (shared) => {
    showModal('share')
    setShareData({
      title: shared.title,
      description: shared.description,
      image: shared.cover,
      url: getShareUrl({ pathname: `/${shared.slug}` }),
    })
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
                  'view-switcher__item--selected': searchParams().by === 'rating',
                })}
              >
                <span class="link" onClick={() => changeSearchParams({ by: 'rating' })}>
                  {t('Top rated')}
                </span>
              </li>
              <li
                class={clsx({
                  'view-switcher__item--selected': searchParams().by === 'last_comment',
                })}
              >
                <span class="link" onClick={() => changeSearchParams({ by: 'last_comment' })}>
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
                    shareClick={(shared) => handleShare(shared)}
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
                          <AuthorLink author={comment.createdBy as Author} size={'XS'} />
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
            <Show when={unratedArticles().length > 0}>
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
          imageUrl={shareData().image}
          shareUrl={shareData().url}
        />
      </Show>
    </div>
  )
}
