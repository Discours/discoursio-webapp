import { clsx } from 'clsx'
import { For, Show, createEffect, createSignal, onMount } from 'solid-js'
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
  searchQuery?: string
  allAuthorsLength?: number
}

const PAGE_SIZE = 20
export const AuthorsList = (props: Props) => {
  const { t } = useLocalize()
  const { isOwnerSubscribed } = useFollowing()
  const { authorsByShouts, authorsByFollowers } = useAuthorsStore()
  const [loading, setLoading] = createSignal(false)
  const [currentPage, setCurrentPage] = createSignal({ shouts: 0, followers: 0 })
  const [allLoaded, setAllLoaded] = createSignal(false)

  const fetchAuthors = async (queryType: 'shouts' | 'followers', page: number) => {
    setLoading(true)

    const offset = PAGE_SIZE * page
    console.log('!!! offset:', offset)
    const result = await apiClient.loadAuthorsBy({
      by: { order: queryType },
      limit: PAGE_SIZE,
      offset,
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
    const nextPage = currentPage()[props.query] + 1
    fetchAuthors(props.query, nextPage).then(() =>
      setCurrentPage({ ...currentPage(), [props.query]: nextPage }),
    )
  }

  onMount(() => {
    fetchAuthors(props.query, currentPage()[props.query]).then(() =>
      setCurrentPage({ ...currentPage(), [props.query]: currentPage()[props.query] + 1 }),
    )
  })

  const authorsList = () => (props.query === 'shouts' ? authorsByShouts() : authorsByFollowers())

  createEffect(() => {
    if (props.searchQuery) {
      // search logic
    }
  })

  createEffect(() => {
    setAllLoaded(authorsByShouts().length === authorsList.length)
  })

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
      <div class="row">
        <div class="col-lg-20 col-xl-18">
          <div class={styles.action}>
            <Show when={!loading() && authorsList().length > 0 && !allLoaded()}>
              <Button value={t('Load more')} onClick={loadMoreAuthors} />
            </Show>
            <Show when={loading() && !allLoaded()}>
              <InlineLoader />
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}
