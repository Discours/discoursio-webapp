import { createInfiniteScroll } from '@solid-primitives/pagination'
import { clsx } from 'clsx'
import { For, Show, createEffect } from 'solid-js'
import { useFollowing } from '../../context/following'
import { apiClient } from '../../graphql/client/core'
import type { Author } from '../../graphql/schema/core.gen'
import { AuthorBadge } from '../Author/AuthorBadge'
import { InlineLoader } from '../InlineLoader'
import styles from './AuthorsList.module.scss'

type Props = {
  class?: string
  query: 'shouts' | 'followers'
}

const PAGE_SIZE = 20
export const AuthorsList = (props: Props) => {
  const { isOwnerSubscribed } = useFollowing()
  const fetchAuthors = async (page: number) => {
    console.log('!!! fetchAuthors:')
    return apiClient.loadAuthorsBy({
      by: { order: props.query },
      limit: PAGE_SIZE,
      offset: PAGE_SIZE * page,
    })
  }

  const [pages, setEl, { setPage, setPages, end, setEnd }] = createInfiniteScroll(fetchAuthors)

  createEffect(() => {
    setPage(0)
    setPages([])
    setEnd(false)
    fetchAuthors(0).then((newPages) => {
      setPages(newPages)
      if (newPages.length < PAGE_SIZE) {
        setEnd(true)
      }
    })
  })

  createEffect(() => {
    console.log('!!! pages():', pages())
  })

  return (
    <div class={clsx(styles.AuthorsList, props.class)}>
      <For each={pages()}>
        {(author: Author) => (
          <div class="row">
            <div class="col-lg-20 col-xl-18">
              <AuthorBadge
                author={author}
                isFollowed={{
                  loaded: Boolean(pages().length),
                  value: isOwnerSubscribed(author.id),
                }}
              />
            </div>
          </div>
        )}
      </For>
      <Show when={!end()}>
        <div ref={setEl as (e: HTMLDivElement) => void}>
          <InlineLoader />
        </div>
      </Show>
    </div>
  )
}
