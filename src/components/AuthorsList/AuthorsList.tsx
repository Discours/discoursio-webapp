import { createInfiniteScroll } from '@solid-primitives/pagination'
import { clsx } from 'clsx'
import { For, Show, createEffect } from 'solid-js'
import { useFollowing } from '../../context/following'
import { apiClient } from '../../graphql/client/core'
import type { Author } from '../../graphql/schema/core.gen'
import { setAuthorsByFollowers, setAuthorsByShouts, useAuthorsStore } from '../../stores/zine/authors'
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
  const { authorsByShouts, authorsByFollowers } = useAuthorsStore()

  const fetchAuthors = async (page: number) => {
    const scrollTop = window.scrollY
    const getPage = () => {
      if (props.query === 'shouts') {
        return authorsByShouts().length / PAGE_SIZE
      }
      if (props.query === 'followers') {
        return authorsByFollowers().length / PAGE_SIZE
      }
      return page
    }

    const result = await apiClient.loadAuthorsBy({
      by: { order: props.query },
      limit: PAGE_SIZE,
      offset: PAGE_SIZE * getPage(),
    })

    if (props.query === 'shouts') {
      setAuthorsByShouts((prev) => [...prev, ...result])
    } else if (props.query === 'followers') {
      setAuthorsByFollowers((prev) => [...prev, ...result])
    }

    requestAnimationFrame(() => {
      window.scrollTo(0, scrollTop)
    })

    return result
  }

  const [pages, setEl, { setPage, setPages, end, setEnd }] = createInfiniteScroll(fetchAuthors)

  createEffect(() => {
    const initialData = props.query === 'shouts' ? authorsByShouts() : authorsByFollowers()
    setPage(0)
    setPages(initialData)
    setEnd(false)
  })

  return (
    <Show when={pages()}>
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
    </Show>
  )
}
