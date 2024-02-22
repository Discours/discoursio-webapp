import { clsx } from 'clsx'
import { For, Show, createEffect, createSignal } from 'solid-js'
import { useFollowing } from '../../context/following'
import { useLocalize } from '../../context/localize'
import { apiClient } from '../../graphql/client/core'
import { setAuthorsByFollowers, setAuthorsByShouts, useAuthorsStore } from '../../stores/zine/authors'
import { AuthorBadge } from '../Author/AuthorBadge'
import { InlineLoader } from '../InlineLoader'
import { Button } from '../_shared/Button'
import styles from './AuthorsList.module.scss'

type Props = {
  class?: string
  query: 'shouts' | 'followers'
}

const PAGE_SIZE = 20
export const AuthorsList = (props: Props) => {
  const { t } = useLocalize()
  const { isOwnerSubscribed } = useFollowing()
  const [loading, setLoading] = createSignal(false)
  const [currentPage, setCurrentPage] = createSignal({ shouts: 0, followers: 0 })
  const { authorsByShouts, authorsByFollowers } = useAuthorsStore()

  const fetchAuthors = async (queryType: 'shouts' | 'followers', page: number) => {
    setLoading(true)
    const offset = PAGE_SIZE * page
    const result = await apiClient.loadAuthorsBy({
      by: { order: queryType },
      limit: PAGE_SIZE,
      offset: offset,
    })

    if (queryType === 'shouts') {
      setAuthorsByShouts((prev) => [...prev, ...result])
    } else {
      setAuthorsByFollowers((prev) => [...prev, ...result])
    }
    setLoading(false)
    return result
  }

  const loadMoreAuthors = () => {
    const queryType = props.query
    const nextPage = currentPage()[queryType] + 1
    fetchAuthors(queryType, nextPage).then(() =>
      setCurrentPage({ ...currentPage(), [queryType]: nextPage }),
    )
  }

  createEffect(() => {
    const queryType = props.query
    if (
      currentPage()[queryType] === 0 &&
      (authorsByShouts().length === 0 || authorsByFollowers().length === 0)
    ) {
      loadMoreAuthors()
    }
  })

  const authorsList = () => (props.query === 'shouts' ? authorsByShouts() : authorsByFollowers())

  return (
    <div class={clsx(styles.AuthorsList, props.class)}>
      <For each={authorsList()}>
        {(author) => (
          <div class="row">
            <div class="col-lg-20 col-xl-18">
              <AuthorBadge
                author={author}
                isFollowed={{
                  loaded: !loading(),
                  value: isOwnerSubscribed(author.id),
                }}
              />
            </div>
          </div>
        )}
      </For>
      <div class={styles.action}>
        <Show when={!loading()}>
          <Button value={t('Load more')} onClick={loadMoreAuthors} />
        </Show>
        <Show when={loading()}>
          <InlineLoader />
        </Show>
      </div>
    </div>
  )
}
