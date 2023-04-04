import { capitalize, formatDate } from '../../utils'
import { Icon } from '../_shared/Icon'
import { AuthorCard } from '../Author/Card'
import { createMemo, createSignal, For, Match, onMount, Show, Switch } from 'solid-js'
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
import { router } from '../../stores/router'
import { useReactions } from '../../context/reactions'
import { Title } from '@solidjs/meta'
import { useLocalize } from '../../context/localize'
import stylesHeader from '../Nav/Header.module.scss'
import styles from './Article.module.scss'

interface ArticleProps {
  article: Shout
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

  const bookmark = (ev) => {
    // TODO: implement bookmark clicked
    ev.preventDefault()
  }

  const body = createMemo(() => props.article.body)
  const media = createMemo(() => {
    const mi = JSON.parse(props.article.media || '[]')
    console.debug(mi)
    return mi
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
              <div class={styles.shoutTopic}>
                <a
                  href={getPagePath(router, 'topic', { slug: props.article.mainTopic })}
                  class={styles.mainTopicLink}
                >
                  {mainTopic().title}
                </a>
              </div>

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
              <div
                class={styles.shoutCover}
                style={{ 'background-image': `url('${props.article.cover}')` }}
              />
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

              <a href="#comments" class={styles.shoutStatsItem}>
                <Icon name="comment" class={styles.icon} />
                {props.article.stat?.commented ?? ''}
              </a>

              <div class={styles.shoutStatsItem}>
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

              <div class={styles.shoutStatsItem} onClick={bookmark}>
                <div class={styles.shoutStatsItemInner}>
                  <Icon name="bookmark" class={styles.icon} />
                </div>
              </div>

              <Show when={canEdit()}>
                <div class={styles.shoutStatsItem}>
                  <a href="/edit" class={styles.shoutStatsItemInner}>
                    <Icon name="edit" class={clsx(styles.icon, styles.iconEdit)} />
                    {t('Edit')}
                  </a>
                </div>
              </Show>
              <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemAdditionalData)}>
                <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemAdditionalDataItem)}>
                  {formattedDate()}
                </div>
              </div>
            </div>
            <div class={styles.help}>
              <Show when={isAuthenticated()}>
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
                    <AuthorCard author={a} compact={false} hasLink={true} liteButtons={true} />
                  </div>
                )}
              </For>
            </div>
            <div id="comments">
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
