import { capitalize } from '../../utils'
import './Full.scss'
import { Icon } from '../Nav/Icon'
import ArticleComment from './Comment'
import { AuthorCard } from '../Author/Card'
import { createMemo, For, onMount, Show } from 'solid-js'
import type { Author, Reaction, Shout } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { showModal } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { incrementView } from '../../stores/zine/articles'
import MD from './MD'
import { SharePopup } from './SharePopup'

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
  const { session } = useAuthStore()

  onMount(() => {
    incrementView({ articleSlug: props.article.slug })
  })

  const formattedDate = createMemo(() => formatDate(new Date(props.article.createdAt)))

  const mainTopic = () =>
    (props.article.topics?.find((topic) => topic?.slug === props.article.mainTopic)?.title || '').replace(
      ' ',
      '&nbsp;'
    )

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://ackee.discours.io/tracker.js'
    script.setAttribute('data-ackee-domain-id', 'dfaf6bc4-163c-4885-9d8b-1e72f7064d42')
    script.setAttribute('data-ackee-server', 'https://ackee.discours.io')
    script.async = true
    document.head.appendChild(script)
  })

  //<script async
  // src="https://ackee.discours.io/tracker.js"
  // data-ackee-server="https://ackee.discours.io"
  // data-ackee-domain-id="dfaf6bc4-163c-4885-9d8b-1e72f7064d42"
  return (
    <div class="shout wide-container">
      <article class="col-md-6 shift-content">
        <div class="shout__header">
          <div class="shout__topic">
            <a href={`/topic/${props.article.mainTopic}`} innerHTML={mainTopic() || ''} />
          </div>

          <h1>{props.article.title}</h1>
          <Show when={props.article.subtitle}>
            <h4>{capitalize(props.article.subtitle, false)}</h4>
          </Show>

          <div class="shout__author">
            <For each={props.article.authors}>
              {(a: Author, index) => (
                <>
                  <Show when={index() > 0}>, </Show>
                  <a href={`/author/${a.slug}`}>{a.name}</a>
                </>
              )}
            </For>
          </div>
          <div class="shout__cover" style={{ 'background-image': `url('${props.article.cover}')` }} />
        </div>

        <Show when={Boolean(props.article.body)}>
          <div class="shout__body">
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
        <div class="shout-stats">
          <div class="shout-stats__item shout-stats__item--likes">
            <Icon name="like" />
            {props.article.stat?.rating || ''}
          </div>

          <div class="shout-stats__item">
            <Icon name="comment" />
            {props.article.stat?.commented || ''}
          </div>
          <div class="shout-stats__item">
            <Icon name="view" />
            {props.article.stat?.viewed}
          </div>
          {/*FIXME*/}
          {/*<div class="shout-stats__item">*/}
          {/*  <a href="#bookmark" onClick={() => console.log(props.article.slug, 'articles')}>*/}
          {/*    <Icon name={'bookmark' + (bookmarked() ? '' : '-x')} />*/}
          {/*  </a>*/}
          {/*</div>*/}
          <div class="shout-stats__item">
            <SharePopup
              trigger={
                <a href="#" onClick={(event) => event.preventDefault()}>
                  <Icon name="share" />
                </a>
              }
            />
          </div>
          {/*FIXME*/}
          {/*<Show when={canEdit()}>*/}
          {/*  <div class="shout-stats__item">*/}
          {/*    <a href="/edit">*/}
          {/*      <Icon name="edit" />*/}
          {/*      {t('Edit')}*/}
          {/*    </a>*/}
          {/*  </div>*/}
          {/*</Show>*/}
          <div class="shout-stats__item shout-stats__item--date">{formattedDate}</div>
        </div>

        <div class="topics-list">
          <For each={props.article.topics}>
            {(topic) => (
              <div class="shout__topic">
                <a href={`/topic/${topic.slug}`}>{topic.title}</a>
              </div>
            )}
          </For>
        </div>

        <div class="shout__authors-list">
          <Show when={props.article?.authors?.length > 1}>
            <h4>{t('Authors')}</h4>
          </Show>
          <For each={props.article?.authors}>
            {(a: Author) => <AuthorCard author={a} compact={false} hasLink={true} />}
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
          <div class="comment-warning" id="comments">
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
          <textarea class="write-comment" rows="1" placeholder={t('Write comment')} />
        </Show>
      </div>
    </div>
  )
}
