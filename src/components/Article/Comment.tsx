import { Show, createMemo, createSignal, For, lazy, Suspense } from 'solid-js'
import { clsx } from 'clsx'
import { getPagePath } from '@nanostores/router'

import MD from './MD'
import { Userpic } from '../Author/Userpic'
import { CommentRatingControl } from './CommentRatingControl'
import { CommentDate } from './CommentDate'
import { ShowIfAuthenticated } from '../_shared/ShowIfAuthenticated'
import { Icon } from '../_shared/Icon'

import { useSession } from '../../context/session'
import { useLocalize } from '../../context/localize'
import { useReactions } from '../../context/reactions'
import { useSnackbar } from '../../context/snackbar'
import { useConfirm } from '../../context/confirm'

import { Author, Reaction, ReactionKind } from '../../graphql/types.gen'
import { router } from '../../stores/router'

import styles from './Comment.module.scss'
import { AuthorLink } from '../Author/AhtorLink'

const SimplifiedEditor = lazy(() => import('../Editor/SimplifiedEditor'))

type Props = {
  comment: Reaction
  compact?: boolean
  isArticleAuthor?: boolean
  sortedComments?: Reaction[]
  lastSeen?: Date
  class?: string
  showArticleLink?: boolean
  clickedReply?: (id: number) => void
  clickedReplyId?: number
}

export const Comment = (props: Props) => {
  const { t } = useLocalize()
  const [isReplyVisible, setIsReplyVisible] = createSignal(false)
  const [loading, setLoading] = createSignal(false)
  const [editMode, setEditMode] = createSignal(false)
  const [clearEditor, setClearEditor] = createSignal(false)
  const { session } = useSession()

  const {
    actions: { createReaction, deleteReaction, updateReaction }
  } = useReactions()

  const {
    actions: { showConfirm }
  } = useConfirm()

  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const isCommentAuthor = createMemo(() => props.comment.createdBy?.slug === session()?.user?.slug)

  const comment = createMemo(() => props.comment)
  const body = createMemo(() => (comment().body || '').trim())
  const remove = async () => {
    if (comment()?.id) {
      try {
        const isConfirmed = await showConfirm({
          confirmBody: t('Are you sure you want to delete this comment?'),
          confirmButtonLabel: t('Delete'),
          confirmButtonVariant: 'danger',
          declineButtonVariant: 'primary'
        })

        if (isConfirmed) {
          await deleteReaction(comment().id)

          await showSnackbar({ body: t('Comment successfully deleted') })
        }
      } catch (error) {
        console.error('[deleteReaction]', error)
      }
    }
  }

  const handleCreate = async (value) => {
    try {
      setLoading(true)
      await createReaction({
        kind: ReactionKind.Comment,
        replyTo: props.comment.id,
        body: value,
        shout: props.comment.shout.id
      })
      setClearEditor(true)
      setIsReplyVisible(false)
      setLoading(false)
    } catch (error) {
      console.error('[handleCreate reaction]:', error)
    }
    setClearEditor(false)
  }

  const toggleEditMode = () => {
    setEditMode((oldEditMode) => !oldEditMode)
  }

  const handleUpdate = async (value) => {
    setLoading(true)
    try {
      await updateReaction(props.comment.id, {
        kind: ReactionKind.Comment,
        body: value,
        shout: props.comment.shout.id
      })
      setEditMode(false)
      setLoading(false)
    } catch (error) {
      console.error('[handleCreate reaction]:', error)
    }
  }

  const createdAt = new Date(comment()?.createdAt)

  return (
    <li
      id={`comment_${comment().id}`}
      class={clsx(styles.comment, props.class, {
        [styles.isNew]: !isCommentAuthor() && createdAt > props.lastSeen
      })}
    >
      <Show when={!!body()}>
        <div class={styles.commentContent}>
          <Show
            when={!props.compact}
            fallback={
              <div>
                <Userpic
                  name={comment().createdBy.name}
                  userpic={comment().createdBy.userpic}
                  class={clsx({
                    [styles.compactUserpic]: props.compact
                  })}
                />
                <small>
                  <a href={`#comment_${comment()?.id}`}>{comment()?.shout.title || ''}</a>
                </small>
              </div>
            }
          >
            <div class={styles.commentDetails}>
              <div class={styles.commentAuthor}>
                <AuthorLink author={comment()?.createdBy as Author} />
              </div>

              <Show when={props.isArticleAuthor}>
                <div class={styles.articleAuthor}>{t('Author')}</div>
              </Show>

              <Show when={props.showArticleLink}>
                <div class={styles.articleLink}>
                  <Icon name="arrow-right" class={styles.articleLinkIcon} />
                  <a
                    href={`${getPagePath(router, 'article', { slug: comment().shout.slug })}?commentId=${
                      comment().id
                    }`}
                  >
                    {comment().shout.title}
                  </a>
                </div>
              </Show>

              <CommentDate comment={comment()} isShort={true} />

              <CommentRatingControl comment={comment()} />
            </div>
          </Show>
          <div class={styles.commentBody}>
            <Show when={editMode()} fallback={<MD body={body()} />}>
              <Suspense fallback={<p>{t('Loading')}</p>}>
                <SimplifiedEditor
                  initialContent={comment().body}
                  submitButtonText={t('Save')}
                  quoteEnabled={true}
                  imageEnabled={true}
                  placeholder={t('Write a comment...')}
                  onSubmit={(value) => handleUpdate(value)}
                  submitByCtrlEnter={true}
                  setClear={clearEditor()}
                />
              </Suspense>
            </Show>
          </div>

          <Show when={!props.compact}>
            <div class={styles.commentControls}>
              <ShowIfAuthenticated>
                <button
                  disabled={loading()}
                  onClick={() => {
                    setIsReplyVisible(!isReplyVisible())
                    props.clickedReply(props.comment.id)
                  }}
                  class={clsx(styles.commentControl, styles.commentControlReply)}
                >
                  <Icon name="reply" class={styles.icon} />
                  {loading() ? t('Loading') : t('Reply')}
                </button>
              </ShowIfAuthenticated>
              <Show when={isCommentAuthor()}>
                <button
                  class={clsx(styles.commentControl, styles.commentControlEdit)}
                  onClick={toggleEditMode}
                >
                  <Icon name="edit" class={styles.icon} />
                  {t('Edit')}
                </button>
                <button
                  class={clsx(styles.commentControl, styles.commentControlDelete)}
                  onClick={() => remove()}
                >
                  <Icon name="delete" class={styles.icon} />
                  {t('Delete')}
                </button>
              </Show>

              {/*<SharePopup*/}
              {/*  title={'artile.title'}*/}
              {/*  description={getDescription(body())}*/}
              {/*  containerCssClass={stylesHeader.control}*/}
              {/*  trigger={*/}
              {/*    <button class={clsx(styles.commentControl, styles.commentControlShare)}>*/}
              {/*      <Icon name="share" class={styles.icon} />*/}
              {/*      {t('Share')}*/}
              {/*    </button>*/}
              {/*  }*/}
              {/*/>*/}

              {/*<button*/}
              {/*  class={clsx(styles.commentControl, styles.commentControlComplain)}*/}
              {/*  onClick={() => showModal('reportComment')}*/}
              {/*>*/}
              {/*  {t('Report')}*/}
              {/*</button>*/}
            </div>

            <Show when={isReplyVisible() && props.clickedReplyId === props.comment.id}>
              <Suspense fallback={<p>{t('Loading')}</p>}>
                <SimplifiedEditor
                  quoteEnabled={true}
                  imageEnabled={true}
                  placeholder={t('Write a comment...')}
                  onSubmit={(value) => handleCreate(value)}
                  submitByCtrlEnter={true}
                />
              </Suspense>
            </Show>
          </Show>
        </div>
      </Show>
      <Show when={props.sortedComments}>
        <ul>
          <For each={props.sortedComments.filter((r) => r.replyTo === props.comment.id)}>
            {(c) => (
              <Comment
                sortedComments={props.sortedComments}
                isArticleAuthor={props.isArticleAuthor}
                comment={c}
                lastSeen={props.lastSeen}
                clickedReply={props.clickedReply}
                clickedReplyId={props.clickedReplyId}
              />
            )}
          </For>
        </ul>
      </Show>
    </li>
  )
}
