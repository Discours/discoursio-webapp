import styles from './Comment.module.scss'
import { Icon } from '../_shared/Icon'
import { AuthorCard } from '../Author/Card'
import { Show, createMemo, createSignal } from 'solid-js'
import { clsx } from 'clsx'
import type { Author, Reaction as Point } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
// import { createReaction, updateReaction, deleteReaction } from '../../stores/zine/reactions'
import MD from './MD'
import { deleteReaction } from '../../stores/zine/reactions'
import { formatDate } from '../../utils'
import { SharePopup } from './SharePopup'
import stylesHeader from '../Nav/Header.module.scss'

export default (props: {
  level?: number
  comment: Partial<Point>
  canEdit?: boolean
  compact?: boolean
}) => {
  const [isSharePopupVisible, setIsSharePopupVisible] = createSignal(false)
  const [isReplyVisible, setIsReplyVisible] = createSignal(false)

  const comment = createMemo(() => props.comment)
  const body = createMemo(() => (comment().body || '').trim())
  const remove = () => {
    if (comment()?.id) {
      console.log('[comment] removing', comment().id)
      deleteReaction(comment().id)
    }
  }
  const formattedDate = createMemo(() =>
    formatDate(new Date(comment()?.createdAt), { hour: 'numeric', minute: 'numeric' })
  )

  return (
    <div class={clsx(styles.comment, { [styles[`commentLevel${props.level}`]]: Boolean(props.level) })}>
      <Show when={!!body()}>
        <div class={styles.commentContent}>
          <Show
            when={!props.compact}
            fallback={
              <div class={styles.commentDetails}>
                <a href={`/author/${comment()?.createdBy?.slug}`}>
                  @{(comment()?.createdBy || { name: 'anonymous' }).name}
                </a>
                <div class={styles.commentArticle}>
                  <Icon name="reply-arrow" />
                  <a href={`#comment-${comment()?.id}`}>
                    #{(comment()?.shout || { title: 'Lorem ipsum titled' }).title}
                  </a>
                </div>
              </div>
            }
          >
            <div class={styles.commentDetails}>
              <div class={styles.commentAuthor}>
                <AuthorCard
                  author={comment()?.createdBy as Author}
                  hideDescription={true}
                  hideFollow={true}
                  isComments={true}
                  hasLink={true}
                />
              </div>

              <div class={styles.commentDate}>{formattedDate()}</div>
              <div
                class={styles.commentRating}
                classList={{
                  [styles.commentRatingPositive]: comment().stat?.rating > 0,
                  [styles.commentRatingNegative]: comment().stat?.rating < 0
                }}
              >
                <button class={clsx(styles.commentRatingControl, styles.commentRatingControlUp)}></button>
                <div class={styles.commentRatingValue}>{comment().stat?.rating || 0}</div>
                <button class={clsx(styles.commentRatingControl, styles.commentRatingControlDown)}></button>
              </div>
            </div>
          </Show>

          <div
            class={styles.commentBody}
            contenteditable={props.canEdit}
            id={'comment-' + (comment().id || '')}
          >
            <MD body={body()} />
          </div>

          <Show when={!props.compact}>
            <div class={styles.commentControls}>
              <button
                class={clsx(styles.commentControl, styles.commentControlReply)}
                onClick={() => setIsReplyVisible(!isReplyVisible())}
              >
                <Icon name="reply" class={styles.icon} />
                {t('Reply')}
              </button>

              <Show when={props.canEdit}>
                {/*FIXME implement edit comment modal*/}
                {/*<button*/}
                {/*  class={clsx(styles.commentControl, styles.commentControlEdit)}*/}
                {/*  onClick={() => showModal('editComment')}*/}
                {/*>*/}
                {/*  <Icon name="edit" class={styles.icon} />*/}
                {/*  {t('Edit')}*/}
                {/*</button>*/}
                <button
                  class={clsx(styles.commentControl, styles.commentControlDelete)}
                  onClick={() => remove()}
                >
                  <Icon name="delete" class={styles.icon} />
                  {t('Delete')}
                </button>
              </Show>

              <SharePopup
                onVisibilityChange={(isVisible) => {
                  setIsSharePopupVisible(isVisible)
                }}
                containerCssClass={stylesHeader.control}
                trigger={
                  <button class={clsx(styles.commentControl, styles.commentControlShare)}>
                    <Icon name="share" class={styles.icon} />
                    {t('Share')}
                  </button>
                }
              />

              {/*<button*/}
              {/*  class={clsx(styles.commentControl, styles.commentControlComplain)}*/}
              {/*  onClick={() => showModal('reportComment')}*/}
              {/*>*/}
              {/*  {t('Report')}*/}
              {/*</button>*/}
            </div>

            <Show when={isReplyVisible()}>
              <form class={styles.replyForm}>
                <textarea name="reply" id="reply" rows="5"></textarea>
                <div class={styles.replyFormControls}>
                  <button class="button button--light" onClick={() => setIsReplyVisible(false)}>
                    Отмена
                  </button>
                  <button class="button">Отправить</button>
                </div>
              </form>
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  )
}
