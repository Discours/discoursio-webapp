import { A } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Show, Suspense, createMemo, createSignal, lazy } from 'solid-js'
import { useGraphQL } from '~/context/graphql'
import { useSnackbar, useUI } from '~/context/ui'
import deleteReactionMutation from '~/graphql/mutation/core/reaction-destroy'
import { useLocalize } from '../../../context/localize'
import { useReactions } from '../../../context/reactions'
import { useSession } from '../../../context/session'
import {
  Author,
  MutationCreate_ReactionArgs,
  MutationUpdate_ReactionArgs,
  Reaction,
  ReactionKind
} from '../../../graphql/schema/core.gen'
import { AuthorLink } from '../../Author/AuthorLink'
import { Userpic } from '../../Author/Userpic'
import { Icon } from '../../_shared/Icon'
import { ShowIfAuthenticated } from '../../_shared/ShowIfAuthenticated'
import { CommentDate } from '../CommentDate'
import { CommentRatingControl } from '../CommentRatingControl'
import styles from './Comment.module.scss'

const SimplifiedEditor = lazy(() => import('../../Editor/SimplifiedEditor'))

type Props = {
  comment: Reaction
  compact?: boolean
  isArticleAuthor?: boolean
  sortedComments?: Reaction[]
  lastSeen?: number
  class?: string
  showArticleLink?: boolean
  clickedReply?: (id: number) => void
  clickedReplyId?: number
  onDelete?: (id: number) => void
}

export const Comment = (props: Props) => {
  const { t } = useLocalize()
  const [isReplyVisible, setIsReplyVisible] = createSignal(false)
  const [loading, setLoading] = createSignal(false)
  const [editMode, setEditMode] = createSignal(false)
  const [clearEditor, setClearEditor] = createSignal(false)
  const [editedBody, setEditedBody] = createSignal<string>()
  const { session } = useSession()
  const author = createMemo<Author>(() => session()?.user?.app_data?.profile as Author)
  const { createReaction, updateReaction } = useReactions()
  const { showConfirm } = useUI()
  const { showSnackbar } = useSnackbar()
  const { mutation } = useGraphQL()

  const canEdit = createMemo(
    () =>
      Boolean(author()?.id) &&
      (props.comment?.created_by?.slug === author()?.slug || session()?.user?.roles?.includes('editor'))
  )

  const body = createMemo(() => (editedBody() ? editedBody()?.trim() : props.comment.body?.trim() || ''))

  const remove = async () => {
    if (props.comment?.id) {
      try {
        const isConfirmed = await showConfirm({
          confirmBody: t('Are you sure you want to delete this comment?'),
          confirmButtonLabel: t('Delete'),
          confirmButtonVariant: 'danger',
          declineButtonVariant: 'primary'
        })

        if (isConfirmed) {
          const resp = await mutation(deleteReactionMutation, { id: props.comment.id }).toPromise()
          const result = resp?.data?.delete_reaction
          const { error } = result
          const notificationType = error ? 'error' : 'success'
          const notificationMessage = error
            ? t('Failed to delete comment')
            : t('Comment successfully deleted')
          await showSnackbar({
            type: notificationType,
            body: notificationMessage,
            duration: 3
          })

          if (!error && props.onDelete) {
            props.onDelete(props.comment.id)
          }
        }
      } catch (error) {
        await showSnackbar({ body: 'error' })
        console.error('[deleteReaction]', error)
      }
    }
  }

  const handleCreate = async (value: string) => {
    try {
      setLoading(true)
      await createReaction({
        reaction: {
          kind: ReactionKind.Comment,
          reply_to: props.comment.id,
          body: value,
          shout: props.comment.shout.id
        }
      } as MutationCreate_ReactionArgs)
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

  const handleUpdate = async (value: string) => {
    setLoading(true)
    try {
      const reaction = await updateReaction({
        reaction: {
          id: props.comment.id || 0,
          kind: ReactionKind.Comment,
          body: value,
          shout: props.comment.shout.id
        }
      } as MutationUpdate_ReactionArgs)
      if (reaction) {
        setEditedBody(value)
      }
      setEditMode(false)
      setLoading(false)
    } catch (error) {
      console.error('[handleCreate reaction]:', error)
    }
  }

  return (
    <li
      id={`comment_${props.comment.id}`}
      class={clsx(styles.comment, props.class, {
        [styles.isNew]:
          (props.lastSeen || Date.now()) > (props.comment.updated_at || props.comment.created_at)
      })}
    >
      <Show when={!!body()}>
        <div class={styles.commentContent}>
          <Show
            when={!props.compact}
            fallback={
              <div>
                <Userpic
                  name={props.comment.created_by.name || ''}
                  userpic={props.comment.created_by.pic || ''}
                  class={clsx({
                    [styles.compactUserpic]: props.compact
                  })}
                />
                <small>
                  <a href={`#comment_${props.comment?.id}`}>{props.comment?.shout.title || ''}</a>
                </small>
              </div>
            }
          >
            <div class={styles.commentDetails}>
              <div class={styles.commentAuthor}>
                <AuthorLink author={props.comment?.created_by as Author} />
              </div>

              <Show when={props.isArticleAuthor}>
                <div class={styles.articleAuthor}>{t('Author')}</div>
              </Show>

              <Show when={props.showArticleLink}>
                <div class={styles.articleLink}>
                  <Icon name="arrow-right" class={styles.articleLinkIcon} />
                  <A href={`${props.comment.shout.slug}?commentId=${props.comment.id}`}>
                    {props.comment.shout.title}
                  </A>
                </div>
              </Show>
              <CommentDate showOnHover={true} comment={props.comment} isShort={true} />
              <CommentRatingControl comment={props.comment} />
            </div>
          </Show>
          <div class={styles.commentBody}>
            <Show when={editMode()} fallback={<div innerHTML={body()} />}>
              <Suspense fallback={<p>{t('Loading')}</p>}>
                <SimplifiedEditor
                  initialContent={editedBody() || props.comment.body || ''}
                  submitButtonText={t('Save')}
                  quoteEnabled={true}
                  imageEnabled={true}
                  placeholder={t('Write a comment...')}
                  onSubmit={(value) => handleUpdate(value)}
                  submitByCtrlEnter={true}
                  onCancel={() => setEditMode(false)}
                  setClear={clearEditor()}
                />
              </Suspense>
            </Show>
          </div>

          <Show when={!props.compact}>
            <div>
              <ShowIfAuthenticated>
                <button
                  disabled={loading()}
                  onClick={() => {
                    setIsReplyVisible(!isReplyVisible())
                    props.clickedReply?.(props.comment.id)
                  }}
                  class={clsx(styles.commentControl, styles.commentControlReply)}
                >
                  <Icon name="reply" class={styles.icon} />
                  {loading() ? t('Loading') : t('Reply')}
                </button>
              </ShowIfAuthenticated>
              <Show when={canEdit()}>
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
              {/*  title={'article.title'}*/}
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
          <For each={props.sortedComments?.filter((r) => r.reply_to === props.comment.id)}>
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
