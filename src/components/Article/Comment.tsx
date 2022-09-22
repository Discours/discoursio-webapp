import './Comment.scss'
import { Icon } from '../Nav/Icon'
import { AuthorCard } from '../Author/Card'
import { Show } from 'solid-js/web'
import { clsx } from 'clsx'
import type { Author, Reaction as Point } from '../../graphql/types.gen'
import { createMemo, createSignal, onMount } from 'solid-js'
import { t } from '../../utils/intl'
// import { createReaction, updateReaction, deleteReaction } from '../../stores/zine/reactions'
import { renderMarkdown } from '@astrojs/markdown-remark'
import { markdownOptions } from '../../../mdx.config'
import { deleteReaction } from '../../stores/zine/reactions'

export default (props: {
  level?: number
  comment: Partial<Point>
  canEdit?: boolean
  compact?: boolean
}) => {
  const comment = createMemo(() => props.comment)
  const [body, setBody] = createSignal('')
  onMount(() => {
    const b: string = props.comment?.body
    if (b?.toString().startsWith('<')) {
      setBody(b)
    } else {
      renderMarkdown(b, markdownOptions).then(({ code }) => setBody(code))
    }
  })
  const remove = () => {
    if (comment()?.id) {
      console.log('[comment] removing', comment().id)
      deleteReaction(comment().id)
    }
  }

  return (
    <div class={clsx('comment', { [`comment--level-${props.level}`]: Boolean(props.level) })}>
      <Show when={!!body()}>
        <div class="comment__content">
          <Show
            when={!props.compact}
            fallback={
              <div class="comment__details">
                <a href={`/author/${comment()?.createdBy?.slug}`}>
                  @{(comment()?.createdBy || { name: 'anonymous' }).name}
                </a>
                <div class="comment__article">
                  <Icon name="reply-arrow" />
                  <a href={`#comment-${comment()?.id}`}>
                    #{(comment()?.shout || { title: 'Lorem ipsum titled' }).title}
                  </a>
                </div>
              </div>
            }
          >
            <div class="comment__details">
              <div class="comment-author">
                <AuthorCard
                  author={comment()?.createdBy as Author}
                  hideDescription={true}
                  hideFollow={true}
                />
              </div>

              <div class="comment-date">{comment()?.createdAt}</div>
              <div class="comment-rating">{comment().stat.rating}</div>
            </div>
          </Show>

          <div class="comment-body" contenteditable={props.canEdit} id={'comment-' + (comment().id || '')}>
            <div innerHTML={body()} />
          </div>

          <Show when={!props.compact}>
            <div class="comment-controls">
              <button class="comment-control comment-control--reply">
                <Icon name="reply" />
                {t('Reply')}
              </button>

              <Show when={props.canEdit}>
                {/*FIXME implement edit comment modal*/}
                {/*<button*/}
                {/*  class="comment-control comment-control--edit"*/}
                {/*  onClick={() => showModal('editComment')}*/}
                {/*>*/}
                {/*  <Icon name="edit" />*/}
                {/*  {t('Edit')}*/}
                {/*</button>*/}
                <button class="comment-control comment-control--delete" onClick={() => remove()}>
                  <Icon name="delete" />
                  {t('Delete')}
                </button>
              </Show>

              {/*FIXME implement modals */}
              {/*<button*/}
              {/*  class="comment-control comment-control--share"*/}
              {/*  onClick={() => showModal('shareComment')}*/}
              {/*>*/}
              {/*  {t('Share')}*/}
              {/*</button>*/}
              {/*<button*/}
              {/*  class="comment-control comment-control--complain"*/}
              {/*  onClick={() => showModal('reportComment')}*/}
              {/*>*/}
              {/*  {t('Report')}*/}
              {/*</button>*/}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}
