import { capitalize } from '../../utils'
import './Full.scss'
import { Icon } from '../_shared/Icon'
import ArticleComment from './Comment'
import { AuthorCard } from '../Author/Card'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import type { Author, Reaction, Shout } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { showModal } from '../../stores/ui'
import MD from './MD'
import { SharePopup } from './SharePopup'
import { useSession } from '../../context/session'
import stylesHeader from '../Nav/Header.module.scss'
import styles from '../../styles/Article.module.scss'
import RatingControl from './RatingControl'
import { clsx } from 'clsx'

const MAX_COMMENT_LEVEL = 6

const getCommentLevel = (comment: Reaction, level = 0) => {
  if (comment && comment.replyTo && level < MAX_COMMENT_LEVEL) {
    return 0 // FIXME: getCommentLevel(commentsById[c.replyTo], level + 1)
  }
  return level
}

interface ArticleProps {
  article: Shout
  reactions: Reaction[]
  isCommentsLoading: boolean
}

const formatDate = (date: Date) => {
  return date
    .toLocaleDateString('ru', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    .replace(' г.', '')
}

export const FullArticle = (props: ArticleProps) => {
  const { session } = useSession()
  const formattedDate = createMemo(() => formatDate(new Date(props.article.createdAt)))
  const [isSharePopupVisible, setIsSharePopupVisible] = createSignal(false)

  const mainTopic = () =>
    (props.article.topics?.find((topic) => topic?.slug === props.article.mainTopic)?.title || '').replace(
      ' ',
      '&nbsp;'
    )

  onMount(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://ackee.discours.io/increment.js'
    script.setAttribute('data-ackee-server', 'https://ackee.discours.io')
    script.setAttribute('data-ackee-domain-id', '1004abeb-89b2-4e85-ad97-74f8d2c8ed2d')
    document.body.appendChild(script)
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

  return (
    <div class="shout wide-container">
      <article class="col-md-6 shift-content">
        <div class={styles.shoutHeader}>
          <div class={styles.shoutTopic}>
            <a href={`/topic/${props.article.mainTopic}`} innerHTML={mainTopic() || ''} />
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

        <Show when={Boolean(props.article.body)}>
          <div class={styles.shoutBody}>
            <Show
              when={!props.article.body.startsWith('<')}
              fallback={<div innerHTML={props.article.body} />}
            >
              <MD body={props.article.body} />
            </Show>
          </div>
        </Show>
      </article>

      <div class="col-md-8 shift-content">
        <div class={styles.shoutStats}>
          <div class={styles.shoutStatsItem}>
            <RatingControl rating={props.article.stat?.rating} />
          </div>

          <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemLikes)}>
            <Icon name="like" class={styles.icon} />
            {props.article.stat?.rating || ''}
          </div>

          <div class={styles.shoutStatsItem}>
            <Icon name="comment" class={styles.icon} />
            {props.article.stat?.commented || ''}
          </div>
          {/*FIXME*/}
          {/*<div class={styles.shoutStatsItem}>*/}
          {/*  <a href="#bookmark" onClick={() => console.log(props.article.slug, 'articles')}>*/}
          {/*    <Icon name={'bookmark' + (bookmarked() ? '' : '-x')} />*/}
          {/*  </a>*/}
          {/*</div>*/}
          <div class={styles.shoutStatsItem}>
            <SharePopup
              onVisibilityChange={(isVisible) => {
                setIsSharePopupVisible(isVisible)
              }}
              containerCssClass={stylesHeader.control}
              trigger={<Icon name="share" class={styles.icon} />}
            />
          </div>
          <div class={styles.shoutStatsItem}>
            <Icon name="bookmark" class={styles.icon} />
          </div>

          {/*FIXME*/}
          {/*<Show when={canEdit()}>*/}
          {/*  <div class={styles.shoutStatsItem}>*/}
          {/*    <a href="/edit">*/}
          {/*      <Icon name="edit" />*/}
          {/*      {t('Edit')}*/}
          {/*    </a>*/}
          {/*  </div>*/}
          {/*</Show>*/}
          <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemAdditionalData)}>
            <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemAdditionalDataItem)}>
              {formattedDate}
            </div>

            <Show when={props.article.stat?.viewed}>
              <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemAdditionalDataItem)}>
                <Icon name="view" class={styles.icon} />
                {props.article.stat?.viewed}
              </div>
            </Show>
          </div>
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
              <div class="col-md-6">
                <AuthorCard author={a} compact={false} hasLink={true} liteButtons={true} />
              </div>
            )}
          </For>
        </div>

        <Show when={props.reactions?.length}>
          <h2 id="comments">
            {t('Comments')} {props.reactions?.length.toString() || ''}
          </h2>

          <For each={props.reactions?.filter((r) => r.body)}>
            {(reaction) => (
              <ArticleComment
                comment={reaction}
                level={getCommentLevel(reaction)}
                canEdit={reaction.createdBy?.slug === session()?.user?.slug}
              />
            )}
          </For>
        </Show>
        <Show when={!session()?.user?.slug}>
          <div class={styles.commentWarning} id="comments">
            {t('To leave a comment you please')}
            <a
              href={''}
              onClick={(evt) => {
                evt.preventDefault()
                showModal('auth')
              }}
            >
              <i>{t('sign up or sign in')}</i>
            </a>
          </div>
        </Show>
        <Show when={session()?.user?.slug}>
          <textarea class={styles.writeComment} rows="1" placeholder={t('Write comment')} />
        </Show>
      </div>
    </div>
  )
}
