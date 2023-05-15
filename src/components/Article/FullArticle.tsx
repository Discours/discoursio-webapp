import { capitalize, formatDate } from '../../utils'
import { Icon } from '../_shared/Icon'
import { AuthorCard } from '../Author/AuthorCard'
import { createEffect, createMemo, createSignal, For, Match, onMount, Show, Switch } from 'solid-js'
import type { Author, Shout } from '../../graphql/types.gen'
import MD from './MD'
import { SharePopup } from './SharePopup'
import { getDescription } from '../../utils/meta'
import { ShoutRatingControl } from './ShoutRatingControl'
import { clsx } from 'clsx'
import { CommentsTree } from './CommentsTree'
import { useSession } from '../../context/session'
import VideoPlayer from './VideoPlayer'
import Slider from '../_shared/Slider'
import { getPagePath } from '@nanostores/router'
import { router, useRouter } from '../../stores/router'
import { useReactions } from '../../context/reactions'
import { Title } from '@solidjs/meta'
import { useLocalize } from '../../context/localize'
import stylesHeader from '../Nav/Header.module.scss'
import styles from './Article.module.scss'
import { imageProxy } from '../../utils/imageProxy'
import { Popover } from '../_shared/Popover'

interface ArticleProps {
  article: Shout
  scrollToComments?: boolean
}

interface MediaItem {
  url?: string
  pic?: string
  title?: string
  body?: string
}

const MediaView = (props: { media: MediaItem; kind: Shout['layout'] }) => {
  const { t } = useLocalize()

  return (
    <>
      <Switch fallback={<a href={props.media.url}>{t('Cannot show this media type')}</a>}>
        <Match when={props.kind === 'audio'}>
          <div>
            <h5>{props.media.title}</h5>
            <audio controls>
              <source src={props.media.url} />
            </audio>
            <hr />
          </div>
        </Match>
        <Match when={props.kind === 'video'}>
          <VideoPlayer url={props.media.url} />
        </Match>
      </Switch>
    </>
  )
}

export const FullArticle = (props: ArticleProps) => {
  const { t } = useLocalize()
  const { user, isAuthenticated } = useSession()
  const [isReactionsLoaded, setIsReactionsLoaded] = createSignal(false)
  const formattedDate = createMemo(() => formatDate(new Date(props.article.createdAt)))

  const mainTopic = createMemo(
    () =>
      props.article.topics?.find((topic) => topic?.slug === props.article.mainTopic) ||
      props.article.topics[0]
  )

  onMount(async () => {
    await loadReactionsBy({
      by: { shout: props.article.slug }
    })

    setIsReactionsLoaded(true)
  })

  const canEdit = () => props.article.authors?.some((a) => a.slug === user()?.slug)
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleBookmarkButtonClick = (ev) => {
    // TODO: implement bookmark clicked
    ev.preventDefault()
  }

  const body = createMemo(() => props.article.body)
  const media = createMemo(() => {
    const mi = JSON.parse(props.article.media || '[]')
    console.debug('!!! media items', mi)
    return mi
  })

  const commentsRef: { current: HTMLDivElement } = { current: null }
  const scrollToComments = () => {
    window.scrollTo({
      top: commentsRef.current.offsetTop - 96,
      left: 0,
      behavior: 'smooth'
    })
  }
  const { searchParams, changeSearchParam } = useRouter()

  createEffect(() => {
    if (props.scrollToComments) {
      scrollToComments()
    }
  })

  createEffect(() => {
    if (searchParams()?.scrollTo === 'comments' && commentsRef.current) {
      scrollToComments()
      changeSearchParam('scrollTo', null)
    }
  })

  const {
    actions: { loadReactionsBy }
  } = useReactions()

  return (
    <>
      <Title>{props.article.title}</Title>
      <div class="wide-container">
        <div class="row">
          <article class="col-md-16 col-lg-14 col-xl-12 offset-md-5">
            <div class={styles.shoutHeader}>
              <Show when={mainTopic()}>
                <div class={styles.shoutTopic}>
                  <a
                    href={getPagePath(router, 'topic', { slug: props.article.mainTopic })}
                    class={styles.mainTopicLink}
                  >
                    {mainTopic().title}
                  </a>
                </div>
              </Show>

              <h1>{props.article.title}</h1>
              <Show when={props.article.subtitle}>
                <h4>{capitalize(props.article.subtitle, false)}</h4>
              </Show>

              <div class={styles.shoutAuthor}>
                <For each={props.article.authors}>
                  {(a: Author, index) => (
                    <>
                      <Show when={index() > 0}>, </Show>
                      <a href={getPagePath(router, 'author', { slug: a.slug })}>{a.name}</a>
                    </>
                  )}
                </For>
              </div>
              <Show when={props.article.cover}>
                <div
                  class={styles.shoutCover}
                  style={{ 'background-image': `url('${imageProxy(props.article.cover)}')` }}
                />
              </Show>
            </div>

            <Show when={media() && props.article.layout !== 'image'}>
              <div class="media-items">
                <For each={media() || []}>
                  {(m: MediaItem) => (
                    <div class={styles.shoutMediaBody}>
                      <MediaView media={m} kind={props.article.layout} />
                      <Show when={m?.body}>
                        <div innerHTML={m.body} />
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </Show>
            <Show when={body()}>
              <div class={styles.shoutBody}>
                <Show when={!body().startsWith('<')} fallback={<div innerHTML={body()} />}>
                  <MD body={body()} />
                </Show>
              </div>
            </Show>
          </article>
        </div>
      </div>

      <Show when={media() && props.article.layout === 'image'}>
        <Slider slidesPerView={1} isPageGallery={true} isCardsWithCover={true} hasThumbs={true}>
          <For each={media() || []}>
            {(m) => (
              <div class="swiper-slide">
                <div class="swiper-slide__inner">
                  <img src={m.url || m.pic} alt={m.title} loading="lazy" />
                  <div class="swiper-lazy-preloader swiper-lazy-preloader-white" />
                  <div class="image-description" innerHTML={m.title} />
                </div>
              </div>
            )}
          </For>
        </Slider>
      </Show>

      <div class="wide-container">
        <div class="row">
          <div class="col-md-16 offset-md-5">
            <div class={styles.shoutStats}>
              <div class={styles.shoutStatsItem}>
                <ShoutRatingControl shout={props.article} class={styles.ratingControl} />
              </div>

              <Show when={props.article.stat?.viewed}>
                <div class={clsx(styles.shoutStatsItem)}>
                  <Icon name="eye" class={clsx(styles.icon, styles.iconEye)} />
                  {props.article.stat?.viewed}
                </div>
              </Show>
              <Popover content={t('Comment')}>
                {(triggerRef: (el) => void) => (
                  <div class={styles.shoutStatsItem} ref={triggerRef} onClick={scrollToComments}>
                    <Icon name="comment" class={styles.icon} />
                    {props.article.stat?.commented ?? ''}
                  </div>
                )}
              </Popover>
              <Popover content={t('Share')}>
                {(triggerRef: (el) => void) => (
                  <div class={styles.shoutStatsItem} ref={triggerRef}>
                    <SharePopup
                      title={props.article.title}
                      description={getDescription(props.article.body)}
                      imageUrl={props.article.cover}
                      containerCssClass={stylesHeader.control}
                      trigger={
                        <div class={styles.shoutStatsItemInner}>
                          <Icon name="share-outline" class={styles.icon} />
                        </div>
                      }
                    />
                  </div>
                )}
              </Popover>
              <Popover content={t('Add to bookmarks')}>
                {(triggerRef: (el) => void) => (
                  <div class={styles.shoutStatsItem} ref={triggerRef} onClick={handleBookmarkButtonClick}>
                    <div class={styles.shoutStatsItemInner}>
                      <Icon name="bookmark" class={styles.icon} />
                    </div>
                  </div>
                )}
              </Popover>
              <Show when={canEdit()}>
                <Popover content={t('Edit')}>
                  {(triggerRef: (el) => void) => (
                    <div class={styles.shoutStatsItem} ref={triggerRef}>
                      <a
                        href={getPagePath(router, 'edit', { shoutId: props.article.id.toString() })}
                        class={styles.shoutStatsItemInner}
                      >
                        <Icon name="pencil-outline" class={styles.icon} />
                      </a>
                    </div>
                  )}
                </Popover>
              </Show>
              <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemAdditionalData)}>
                <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemAdditionalDataItem)}>
                  {formattedDate()}
                </div>
              </div>
            </div>
            <div class={styles.help}>
              <Show when={isAuthenticated() && !canEdit()}>
                <button class="button">{t('Cooperate')}</button>
              </Show>
              <Show when={canEdit()}>
                <button class="button button--light">{t('Invite to collab')}</button>
              </Show>
            </div>

            <div class={styles.topicsList}>
              <For each={props.article.topics}>
                {(topic) => (
                  <div class={styles.shoutTopic}>
                    <a href={getPagePath(router, 'topic', { slug: topic.slug })}>{topic.title}</a>
                  </div>
                )}
              </For>
            </div>

            <div class={styles.shoutAuthorsList}>
              <Show when={props.article.authors.length > 1}>
                <h4>{t('Authors')}</h4>
              </Show>
              <For each={props.article.authors}>
                {(a) => (
                  <div class="col-xl-12">
                    <AuthorCard author={a} hasLink={true} liteButtons={true} />
                  </div>
                )}
              </For>
            </div>
            <div id="comments" ref={(el) => (commentsRef.current = el)}>
              <Show when={isReactionsLoaded()}>
                <CommentsTree
                  shoutId={props.article.id}
                  shoutSlug={props.article.slug}
                  commentAuthors={props.article.authors}
                />
              </Show>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
