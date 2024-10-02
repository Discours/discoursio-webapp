import { A, createAsync, useLocation, useNavigate, useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, on } from 'solid-js'
import { DropDown } from '~/components/_shared/DropDown'
import { Option } from '~/components/_shared/DropDown/DropDown'
import { Icon } from '~/components/_shared/Icon'
import { InviteMembers } from '~/components/_shared/InviteMembers'
import { Loading } from '~/components/_shared/Loading'
import { ShareModal } from '~/components/_shared/ShareModal'
import { useAuthors } from '~/context/authors'
import { useLocalize } from '~/context/localize'
import { useReactions } from '~/context/reactions'
import { useSession } from '~/context/session'
import { useTopics } from '~/context/topics'
import { useUI } from '~/context/ui'
import { loadUnratedShouts } from '~/graphql/api/private'
import type { Author, Reaction, Shout } from '~/graphql/schema/core.gen'
import { FeedSearchParams } from '~/routes/feed/[...order]'
import { byCreated } from '~/utils/sort'
import { CommentDate } from '../Article/CommentDate'
import { getShareUrl } from '../Article/SharePopup'
import { AuthorBadge } from '../Author/AuthorBadge'
import { AuthorLink } from '../Author/AuthorLink'
import { ArticleCard } from '../Feed/ArticleCard'
import { Placeholder } from '../Feed/Placeholder'
import { Sidebar } from '../Feed/Sidebar'
import { Modal } from '../_shared/Modal'

import styles from '~/styles/views/Feed.module.scss'
import stylesBeside from '../Feed/Beside.module.scss'
import stylesTopic from '../Feed/CardTopic.module.scss'

export const FEED_PAGE_SIZE = 20
export type PeriodType = 'week' | 'month' | 'year'

export type FeedProps = {
  shouts: Shout[]
  mode?: 'followed' | 'discussed' | 'coauthored' | 'unrated' | 'all'
  order?: '' | 'likes' | 'hot'
}

const PERIODS = {
  day: 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
  year: 365 * 24 * 60 * 60
}

export const FeedView = (props: FeedProps) => {
  const { t } = useLocalize()
  const loc = useLocation()
  const { client, session } = useSession()

  const unrated = createAsync(async () => {
    if (client()) {
      const shoutsLoader = loadUnratedShouts(client(), { limit: 5 })
      return await shoutsLoader()
    }
  })
  const navigate = useNavigate()
  const { showModal } = useUI()
  const [isLoading, setIsLoading] = createSignal(false)
  const [isRightColumnLoaded, setIsRightColumnLoaded] = createSignal(false)
  const { loadReactionsBy } = useReactions()
  const { topTopics } = useTopics()
  const { topAuthors } = useAuthors()
  const [topComments, setTopComments] = createSignal<Reaction[]>([])
  const [searchParams, changeSearchParams] = useSearchParams<FeedSearchParams>()
  const loadTopComments = async () => {
    const comments = await loadReactionsBy({ by: { comment: true }, limit: 50 })
    setTopComments(comments.sort(byCreated).reverse())
  }

  // post-load
  createEffect(
    on(
      () => props.shouts,
      (sss?: Shout[]) => {
        if (sss && Array.isArray(sss)) {
          setIsLoading(true)
          Promise.all([
            loadTopComments(),
            loadReactionsBy({ by: { shouts: sss.map((s: Shout) => s.slug) } })
          ]).finally(() => {
            console.debug('[views.feed] finally loaded reactions, data loading finished')
            setIsRightColumnLoaded(true)
            setIsLoading(false)
          })
        }
      },
      { defer: true }
    )
  )

  const [shareData, setShareData] = createSignal<Shout | undefined>()
  const handleShare = (shared: Shout | undefined) => {
    showModal('share')
    setShareData(shared)
  }

  const asOption = (o: string) => {
    const value = Math.floor(Date.now() / 1000) - PERIODS[o as keyof typeof PERIODS]
    return { value, title: t(o) }
  }
  const asOptions = (opts: string[]) => opts.map(asOption)
  const currentPeriod = createMemo(() => asOption(searchParams?.period || ''))

  return (
    <div class={clsx('wide-container', styles.feed)}>
      <div class="row">
        <div class={clsx('col-md-5 col-xl-4', styles.feedNavigation)}>
          <Sidebar />
        </div>

        <div class="col-md-12 offset-xl-1">
          <Show when={!session() && loc?.pathname !== 'feed'}>
            <Placeholder type={loc?.pathname} mode="feed" />
          </Show>

          <Show when={(session() || loc?.pathname === 'feed') && props.shouts}>
            <div class={styles.filtersContainer}>
              <ul class={clsx('view-switcher', styles.feedFilter)}>
                <li class={clsx({ 'view-switcher__item--selected': !props.order })}>
                  <A href={loc.pathname}>{t('Recent')}</A>
                </li>
                <li
                  class={clsx({
                    'view-switcher__item--selected': props.order === 'likes'
                  })}
                >
                  <A class="link" href={'/feed/likes'}>
                    {t('Liked')}
                  </A>
                </li>
                <li
                  class={clsx({
                    'view-switcher__item--selected': props.order === 'hot'
                  })}
                >
                  <A class="link" href={'/feed/hot'}>
                    {t('Commented')}
                  </A>
                </li>
              </ul>
              <div class={styles.dropdowns}>
                <Show when={searchParams?.period}>
                  <DropDown
                    popupProps={{ horizontalAnchor: 'right' }}
                    options={asOptions(['week', 'month', 'year'])}
                    currentOption={currentPeriod()}
                    triggerCssClass={styles.periodSwitcher}
                    onChange={(period: Option) => changeSearchParams({ period: period.value })}
                  />
                </Show>
                <DropDown
                  popupProps={{ horizontalAnchor: 'right' }}
                  options={asOptions(['all', 'featured', 'followed', 'unrated', 'discussed', 'coauthored'])}
                  currentOption={asOption(props.mode || '')}
                  triggerCssClass={styles.periodSwitcher}
                  onChange={(mode: Option) => navigate(`/feed/${mode.value}`)}
                />
              </div>
            </div>

            <Show when={!isLoading()} fallback={<Loading />}>
              <Show when={(props.shouts || []).length > 0}>
                <For each={(props.shouts || []).slice(0, 4)}>
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
                    <a href="/author">
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

                <For each={(props.shouts || []).slice(4)}>
                  {(article) => (
                    <ArticleCard article={article} settings={{ isFeedMode: true }} desktopCoverSize="M" />
                  )}
                </For>
              </Show>
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
                          <A
                            href={`/${comment.shout.slug}?commentId=${comment.id}`}
                            innerHTML={comment.body || ''}
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
                  <A href={'/guide'}>Как устроен Дискурс</A>
                </li>
                <li>
                  <A href="/how-to-write-a-good-article">Как создать хороший текст</A>
                </li>
                <li>
                  <A href="#">Правила конструктивных дискуссий</A>
                </li>
                <li>
                  <A href={'/principles'}>Принципы сообщества</A>
                </li>
              </ul>
            </section>
            <Show when={unrated()}>
              <section class={clsx(styles.asideSection)}>
                <h4>{t('Be the first to rate')}</h4>
                <For each={unrated()}>
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
          title={shareData()?.title || ''}
          description={shareData()?.description || ''}
          imageUrl={shareData()?.cover || ''}
          shareUrl={getShareUrl({ pathname: `/${shareData()?.slug || ''}` })}
        />
      </Show>

      <Modal variant="medium" name="inviteCoauthors">
        <InviteMembers variant={'coauthors'} title={t('Invite experts')} />
      </Modal>
    </div>
  )
}
