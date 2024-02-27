import { clsx } from 'clsx'
import { For, Show, createEffect, createSignal, on, onMount } from 'solid-js'
import { useFollowing } from '../../context/following'
import { useLocalize } from '../../context/localize'
import { apiClient } from '../../graphql/client/core'
import { Author } from '../../graphql/schema/core.gen'
import { setAuthorsByFollowers, setAuthorsByShouts, useAuthorsStore } from '../../stores/zine/authors'
import { AuthorBadge } from '../Author/AuthorBadge'
import { InlineLoader } from '../InlineLoader'
import { Button } from '../_shared/Button'
import styles from './AuthorsList.module.scss'

type Props = {
  class?: string
  query: 'followers' | 'shouts'
  searchQuery?: string
  allAuthorsLength?: number
}

const PAGE_SIZE = 20

// TODO: проверить нет ли дубликатов в базе данных, если нет - то не использовать addUniqueAuthors()
const addUniqueAuthors = (prevAuthors: Author[], newAuthors: Author[]) => {
  const uniqueNewAuthors = newAuthors.filter(
    (newAuthor) => !prevAuthors.some((prevAuthor) => prevAuthor.id === newAuthor.id),
  )
  return [...prevAuthors, ...uniqueNewAuthors]
}
export const AuthorsList = (props: Props) => {
  const { t } = useLocalize()
  const { isOwnerSubscribed } = useFollowing()
  const { authorsByShouts, authorsByFollowers } = useAuthorsStore()
  const [loading, setLoading] = createSignal(false)
  const [currentPage, setCurrentPage] = createSignal({ shouts: 0, followers: 0 })
  const [allLoaded, setAllLoaded] = createSignal(false)

  const fetchAuthors = async (queryType: Props['query'], page: number) => {
    setLoading(true)
    const offset = PAGE_SIZE * page
    const result = await apiClient.loadAuthorsBy({
      by: { order: queryType },
      limit: PAGE_SIZE,
      offset,
    })

    if (queryType === 'shouts') {
      setAuthorsByShouts((prev) => addUniqueAuthors(prev, result))
    } else {
      setAuthorsByFollowers((prev) => addUniqueAuthors(prev, result))
    }
    setLoading(false)
  }

  const loadMoreAuthors = () => {
    const nextPage = currentPage()[props.query] + 1
    fetchAuthors(props.query, nextPage).then(() =>
      setCurrentPage({ ...currentPage(), [props.query]: nextPage }),
    )
  }

  createEffect(
    on(
      () => props.query,
      (query) => {
        const authorsList = query === 'shouts' ? authorsByShouts() : authorsByFollowers()
        if (authorsList.length === 0 && currentPage()[query] === 0) {
          setCurrentPage((prev) => ({ ...prev, [query]: 0 }))
          fetchAuthors(query, 0).then(() => setCurrentPage((prev) => ({ ...prev, [query]: 1 })))
        }
      },
    ),
  )

  const authorsList = () => (props.query === 'shouts' ? authorsByShouts() : authorsByFollowers())

  // TODO: do it with backend
  // createEffect(() => {
  //   if (props.searchQuery) {
  //     // search logic
  //   }
  // })

  createEffect(() => {
    setAllLoaded(props.allAuthorsLength === authorsList.length)
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
