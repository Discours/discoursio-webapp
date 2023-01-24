import styles from './Comment.module.scss'
import { Icon } from '../_shared/Icon'
import { AuthorCard } from '../Author/Card'
import { Show, createMemo, createSignal, For } from 'solid-js'
import { clsx } from 'clsx'
import type { Author, Reaction } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { createReaction, deleteReaction } from '../../stores/zine/reactions'
import MD from './MD'
import { formatDate } from '../../utils'
import { SharePopup } from './SharePopup'
import stylesHeader from '../Nav/Header.module.scss'
import Userpic from '../Author/Userpic'
import { useSession } from '../../context/session'
import { ReactionKind } from '../../graphql/types.gen'
import CommentEditor from '../_shared/CommentEditor'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'

type Props = {
  comment: Reaction
  compact?: boolean
  reactions?: Reaction[]
}

const Comment = (props: Props) => {
  const [isReplyVisible, setIsReplyVisible] = createSignal(false)
  const [loading, setLoading] = createSignal<boolean>(false)
  const [submitted, setSubmitted] = createSignal<boolean>(false)
  const { session } = useSession()

  const canEdit = createMemo(() => props.comment.createdBy?.slug === session()?.user?.slug)

  const comment = createMemo(() => props.comment)
  const body = createMemo(() => (comment().body || '').trim())
  const remove = async () => {
    if (comment()?.id) {
      try {
        await deleteReaction(comment().id)
      } catch (error) {
        console.error('[deleteReaction]', error)
      }
    }
  }

  const handleCreate = async (value) => {
    try {
      setLoading(true)
      await createReaction(
        {
          kind: ReactionKind.Comment,
          replyTo: props.comment.id,
          body: value,
          shout: props.comment.shout.id
        },
        {
          name: session().user.name,
          userpic: session().user.userpic,
          slug: session().user.slug
        }
      )
      setIsReplyVisible(false)
      setSubmitted(true)
      setLoading(false)
    } catch (error) {
      console.error('[handleCreate reaction]:', error)
    }
  }

  const formattedDate = createMemo(() =>
    formatDate(new Date(comment()?.createdAt), { hour: 'numeric', minute: 'numeric' })
  )

  return (
    <li class={styles.comment}>
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
            contenteditable={canEdit()}
            id={'comment-' + (comment().id || '')}
          >
            <MD body={body()} />
          </div>

          <Show when={!props.compact}>
            <div class={styles.commentControls}>
              <button
                disabled={loading()}
                onClick={() => setIsReplyVisible(!isReplyVisible())}
                class={clsx(styles.commentControl, styles.commentControlReply)}
              >
                <Icon name="reply" class={styles.icon} />
                {loading() ? t('Loading') : t('Reply')}
              </button>

              <Show when={canEdit()}>
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
              <ShowOnlyOnClient>
                <CommentEditor
                  initialValue={''}
                  clear={submitted()}
                  onSubmit={(value) => handleCreate(value)}
                />
              </ShowOnlyOnClient>
            </Show>
          </Show>
        </div>
      </Show>
      <Show when={props.reactions}>
        <ul>
          <For each={props.reactions.filter((r) => r.replyTo === props.comment.id)}>
            {(reaction) => <Comment reactions={props.reactions} comment={reaction} />}
          </For>
        </ul>
      </Show>
    </li>
  )
}

export default Comment
