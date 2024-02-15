import { createInfiniteScroll } from '@solid-primitives/pagination'
import { clsx } from 'clsx'
import { For, Show } from 'solid-js'
import { useFollowing } from '../../context/following'
import { useLocalize } from '../../context/localize'
import { apiClient } from '../../graphql/client/core'
import type { Author } from '../../graphql/schema/core.gen'
import { AuthorBadge } from '../Author/AuthorBadge'
import { InlineLoader } from '../InlineLoader'
import { Loading } from '../_shared/Loading'
import styles from './AuthorsList.module.scss'

type Props = {
  class?: string
  query: 'shouts' | 'followers'
}

const PAGE_SIZE = 20
export const AuthorsList = (props: Props) => {
  const { t } = useLocalize()
  const { isOwnerSubscribed } = useFollowing()
  const fetchAuthors = async (page: number): Promise<Author[]> => {
    console.log('!!! fetchAuthors:')
    console.log('!!! page:', page)
    return apiClient.loadAuthorsBy({
      by: { order: props.query },
      limit: PAGE_SIZE,
      offset: PAGE_SIZE * page,
    })
  }

  const [authors, setEl, { end, setEnd }] = createInfiniteScroll(fetchAuthors)

  return (
    <div class={clsx(styles.AuthorsList, props.class)}>
      <For each={authors()}>
        {(author: Author) => (
          <div class="row">
            <div class="col-lg-20 col-xl-18">
              <AuthorBadge
                author={author as Author}
                isFollowed={{
                  loaded: Boolean(authors().length),
                  value: isOwnerSubscribed(author.id),
                }}
              />
            </div>
          </div>
        )}
      </For>
      <Show when={!end()}>
        <InlineLoader ref={setEl as (e: HTMLDivElement) => void} />
      </Show>
    </div>
  )
}
