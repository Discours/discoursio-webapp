import { capitalize, formatDate } from '../../utils'
import './Full.scss'
import { Icon } from '../_shared/Icon'
import { AuthorCard } from '../Author/Card'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import type { Author, Reaction, Shout } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import MD from './MD'
import { SharePopup } from './SharePopup'
import stylesHeader from '../Nav/Header.module.scss'
import styles from '../../styles/Article.module.scss'
import RatingControl from './RatingControl'
import { clsx } from 'clsx'
import { CommentsTree } from './CommentsTree'
interface ArticleProps {
  article: Shout
}

export const FullArticle = (props: ArticleProps) => {
  const formattedDate = createMemo(() => formatDate(new Date(props.article.createdAt)))
  const [isSharePopupVisible, setIsSharePopupVisible] = createSignal(false)

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
            <RatingControl rating={props.article.stat?.rating} class={styles.ratingControl} />
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
              {formattedDate()}
            </div>

            <Show when={props.article.stat?.viewed}>
              <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemAdditionalDataItem)}>
                <Icon name="view" class={styles.icon} />
                {props.article.stat?.viewed}
              </div>
            </Show>
          </div>
        </div>

        <div class={styles.help}>
          <button class="button">Соучаствовать</button>
          <button class="button button--light">Пригласить к участию</button>
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
        <CommentsTree shout={props.article?.slug} />
      </div>
    </div>
  )
}
