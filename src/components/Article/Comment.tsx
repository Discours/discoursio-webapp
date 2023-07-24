import styles from './Comment.module.scss'
import { Icon } from '../_shared/Icon'
import { AuthorCard } from '../Author/AuthorCard'
import { Show, createMemo, createSignal, For, lazy, Suspense } from 'solid-js'
import { clsx } from 'clsx'
import type { Author, Reaction } from '../../graphql/types.gen'
import MD from './MD'
import Userpic from '../Author/Userpic'
import { useSession } from '../../context/session'
import { ReactionKind } from '../../graphql/types.gen'
import { useReactions } from '../../context/reactions'
import { useSnackbar } from '../../context/snackbar'
import { ShowIfAuthenticated } from '../_shared/ShowIfAuthenticated'
import { useLocalize } from '../../context/localize'
import { CommentRatingControl } from './CommentRatingControl'
import { getPagePath } from '@nanostores/router'
import { router } from '../../stores/router'
import { CommentDate } from './CommentDate'

const SimplifiedEditor = lazy(() => import('../Editor/SimplifiedEditor'))

type Props = {
  comment: Reaction
  compact?: boolean
  isArticleAuthor?: boolean
  sortedComments?: Reaction[]
  lastSeen?: Date
  class?: string
  showArticleLink?: boolean
}

export const Comment = (props: Props) => {
  const { t } = useLocalize()
  const [isReplyVisible, setIsReplyVisible] = createSignal(false)
  const [loading, setLoading] = createSignal<boolean>(false)
  const [editMode, setEditMode] = createSignal<boolean>(false)
  const { session } = useSession()

  const {
    actions: { createReaction, deleteReaction, updateReaction }
  } = useReactions()

  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const isCommentAuthor = createMemo(() => props.comment.createdBy?.slug === session()?.user?.slug)

  const comment = createMemo(() => props.comment)
  const body = createMemo(() => (comment().body || '').trim())
  const remove = async () => {
    if (comment()?.id) {
      try {
        await deleteReaction(comment().id)
        showSnackbar({ body: t('Comment successfully deleted') })
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
      setIsReplyVisible(false)
      setLoading(false)
    } catch (error) {
      console.error('[handleCreate reaction]:', error)
    }
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
                  user={comment().createdBy as Author}
                  isBig={false}
                  class={clsx({
                    [styles.compactUserpic]: props.compact
                  })}
                />
                <small>
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
          <div class={styles.commentBody} id={'comment-' + (comment().id || '')}>
            <Show when={editMode()} fallback={<MD body={body()} />}>
              <Suspense fallback={<p>{t('Loading')}</p>}>
                <SimplifiedEditor
                  quoteEnabled={true}
                  imageEnabled={true}
                  placeholder={t('Write a comment...')}
                  onSubmit={(value) => handleUpdate(value)}
                  submitByShiftEnter={true}
                />
              </Suspense>
            </Show>
          </div>

          <Show when={!props.compact}>
            <div class={styles.commentControls}>
              <ShowIfAuthenticated>
                <button
                  disabled={loading()}
                  onClick={() => setIsReplyVisible(!isReplyVisible())}
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

            <Show when={isReplyVisible()}>
              <Suspense fallback={<p>{t('Loading')}</p>}>
                <SimplifiedEditor
                  quoteEnabled={true}
                  imageEnabled={true}
                  placeholder={t('Write a comment...')}
                  onSubmit={(value) => handleCreate(value)}
                  submitByShiftEnter={true}
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
              />
            )}
          </For>
        </ul>
      </Show>
    </li>
  )
}
