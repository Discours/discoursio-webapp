import styles from './Comment.module.scss'
import { Icon } from '../_shared/Icon'
import { AuthorCard } from '../Author/Card'
import { Show, createMemo, createSignal, For, createEffect } from 'solid-js'
import { clsx } from 'clsx'
import type { Author, Reaction, Reaction as Point } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { createReaction, updateReaction, deleteReaction } from '../../stores/zine/reactions'
import MD from './MD'
import { formatDate } from '../../utils'
import { SharePopup } from './SharePopup'
import stylesHeader from '../Nav/Header.module.scss'
import Userpic from '../Author/Userpic'
import { ReactionKind } from '../../graphql/types.gen'

type Props = {
  level?: number
  comment: Partial<Point>
  canEdit?: boolean
  compact?: boolean
  children?: Reaction[]
  // parent?: number
}

const Comment = (props: Props) => {
  const [isReplyVisible, setIsReplyVisible] = createSignal(false)
  const [postMessageText, setPostMessageText] = createSignal('')

  const comment = createMemo(() => props.comment)
  const body = createMemo(() => (comment()?.body || '').trim())
  const remove = () => {
    if (comment()?.id) {
      console.log('[comment] removing', comment().id)
      deleteReaction(comment().id)
    }
  }

  const compose = (event) => setPostMessageText(event.target.value)
  const handleCreate = async (event) => {
    console.log('!!! comment().shout.id:', comment().shout.id)
    event.preventDefault()
    await createReaction({
      kind: ReactionKind.Comment,
      replyTo: props.comment.id ?? null,
      body: postMessageText(),
      shout: comment().shout.id
    })
  }
  const formattedDate = createMemo(() =>
    formatDate(new Date(comment()?.createdAt), { hour: 'numeric', minute: 'numeric' })
  )

  return (
    <li class={clsx(styles.comment, { [styles[`commentLevel${props.level}`]]: Boolean(props.level) })}>
      <Show when={!!body()}>
        <div class={styles.commentContent}>
          <Show
            when={!props.compact}
            fallback={
              <div>
                <Userpic user={comment().createdBy as Author} isBig={false} isAuthorsList={false} />
                <small class={styles.commentArticle}>
                  <a href={`#comment-${comment()?.id}`}>{comment()?.shout.title || ''}</a>
                </small>
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
                <button class={clsx(styles.commentRatingControl, styles.commentRatingControlUp)} />
                <div class={styles.commentRatingValue}>{comment().stat?.rating || 0}</div>
                <button class={clsx(styles.commentRatingControl, styles.commentRatingControlDown)} />
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
              <form class={styles.replyForm} onSubmit={(event) => handleCreate(event)}>
                <textarea
                  value={postMessageText()}
                  rows={1}
                  onInput={(event) => compose(event)}
                  placeholder="Написать сообщение"
                />

                <div class={styles.replyFormControls}>
                  <button class="button button--light" onClick={() => setIsReplyVisible(false)}>
                    {t('cancel')}
                  </button>
                  <button type="submit" class="button">
                    {t('Send')}
                  </button>
                </div>
              </form>
            </Show>
          </Show>
        </div>
      </Show>
      <Show when={props.children}>
        <ul>
          <For each={props.children}>
            {(reaction: { children: Reaction[] } & Reaction) => (
              <Comment children={reaction.children} comment={reaction} />
            )}
          </For>
        </ul>
      </Show>
    </li>
  )
}

export default Comment
