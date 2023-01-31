import { capitalize, formatDate } from '../../utils'
import './Full.scss'
import { Icon } from '../_shared/Icon'
import { AuthorCard } from '../Author/Card'
import { createMemo, For, Match, onMount, Show, Switch } from 'solid-js'
import type { Author, Shout } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import MD from './MD'
import { getShareUrl, SharePopup } from './SharePopup'
import { getDescription } from '../../utils/meta'
import stylesHeader from '../Nav/Header.module.scss'
import styles from '../../styles/Article.module.scss'
import { RatingControl } from './RatingControl'
import { clsx } from 'clsx'
import { CommentsTree } from './CommentsTree'
import { useSession } from '../../context/session'
import VideoPlayer from './VideoPlayer'
import Slider from '../_shared/Slider'

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
  const { session } = useSession()
  const formattedDate = createMemo(() => formatDate(new Date(props.article.createdAt)))

  const mainTopic = createMemo(
    () =>
      props.article.topics?.find((topic) => topic?.slug === props.article.mainTopic) ||
      props.article.topics[0]
  )

  const mainTopicTitle = createMemo(() => mainTopic().title.replace(' ', '&nbsp;'))

  onMount(() => {
    const windowHash = window.location.hash
    if (windowHash?.length > 0) {
      const comments = document.querySelector(windowHash)
      if (comments) {
        window.scrollTo({
          top: comments.getBoundingClientRect().top,
          behavior: 'smooth'
        })
      }
    }
  })

  const canEdit = () => props.article.authors?.some((a) => a.slug === session()?.user?.slug)

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

  return (
    <div class="shout wide-container">
      <article class="col-md-6 shift-content">
        <div class={styles.shoutHeader}>
          <div class={styles.shoutTopic}>
            <a href={`/topic/${props.article.mainTopic}`} innerHTML={mainTopicTitle() || ''} />
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
                  <a href={`/author/${a.slug}`}>{a.name}</a>
                </>
              )}
            </For>
          </div>
          <div class={styles.shoutCover} style={{ 'background-image': `url('${props.article.cover}')` }} />
        </div>

        <Show
          when={media() && props.article.layout !== 'image'}
          fallback={
            <Slider>
              <For each={media() || []}>
                {(m: MediaItem) => (
                  <>
                    <img src={m.url || m.pic} alt={m.title} />
                    <div innerHTML={m.body} />
                  </>
                )}
              </For>
            </Slider>
          }
        >
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

      <div class="col-md-8 shift-content">
        <div class={styles.shoutStats}>
          <div class={styles.shoutStatsItem}>
            <RatingControl rating={props.article.stat?.rating} class={styles.ratingControl} />
          </div>

          <Show when={props.article.stat?.viewed}>
            <div class={clsx(styles.shoutStatsItem)}>
              <Icon name="eye" class={clsx(styles.icon, styles.iconEye)} />
              {props.article.stat?.viewed}
            </div>
          </Show>

          <div class={styles.shoutStatsItem}>
            <Icon name="comment" class={styles.icon} />
            {props.article.stat?.commented || ''}
          </div>

          <div class={styles.shoutStatsItem}>
            <SharePopup
              title={props.article.title}
              description={getDescription(props.article.body)}
              imageUrl={props.article.cover}
              shareUrl={getShareUrl()}
              containerCssClass={stylesHeader.control}
              trigger={<Icon name="share-outline" class={styles.icon} />}
            />
          </div>

          <div class={styles.shoutStatsItem} onClick={bookmark}>
            <Icon name="bookmark" class={styles.icon} />
          </div>

          <Show when={canEdit()}>
            <div class={styles.shoutStatsItem}>
              <a href="/edit">
                <Icon name="edit" />
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
          <Show when={session()?.token}>
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
                <a href={`/topic/${topic.slug}`}>{topic.title}</a>
              </div>
            )}
          </For>
        </div>

        <div class={styles.shoutAuthorsList}>
          <Show when={props.article?.authors?.length > 1}>
            <h4>{t('Authors')}</h4>
          </Show>
          <For each={props.article?.authors}>
            {(a: Author) => (
              <div class="col-xl-6">
                <AuthorCard author={a} compact={false} hasLink={true} liteButtons={true} />
              </div>
            )}
          </For>
        </div>
        <CommentsTree
          shoutId={props.article?.id}
          shoutSlug={props.article?.slug}
          commentAuthors={props.article?.authors}
        />
      </div>
    </div>
  )
}
