import { clsx } from 'clsx'
import { For, Show, createEffect, createSignal, on } from 'solid-js'
import { useAuthors } from '~/context/authors'
import { useLocalize } from '~/context/localize'
import { loadAuthors } from '~/graphql/api/public'
import { Author } from '~/graphql/schema/core.gen'
import { AuthorBadge } from '../Author/AuthorBadge'
import { InlineLoader } from '../InlineLoader'
import { AUTHORS_PER_PAGE } from '../Views/AllAuthors/AllAuthors'
import { Button } from '../_shared/Button'
import styles from './AuthorsList.module.scss'

type Props = {
  class?: string
  query: 'followers' | 'shouts'
  searchQuery?: string
  allAuthorsLength?: number
}

// pagination handling, loadAuthors cached from api, addAuthors to context

export const AuthorsList = (props: Props) => {
  const { t } = useLocalize()
  const { addAuthors } = useAuthors()
  const [authorsByShouts, setAuthorsByShouts] = createSignal<Author[]>()
  const [authorsByFollowers, setAuthorsByFollowers] = createSignal<Author[]>()
  const [loading, setLoading] = createSignal(false)
  const [currentPage, setCurrentPage] = createSignal({ shouts: 0, followers: 0 })
  const [allLoaded, setAllLoaded] = createSignal(false)

  const fetchAuthors = async (queryType: Props['query'], page: number) => {
    setLoading(true)
    const offset = AUTHORS_PER_PAGE * page
    const fetcher = await loadAuthors({
      by: { order: queryType },
      limit: AUTHORS_PER_PAGE,
      offset
    })
    const result = await fetcher()
    if (result) {
      addAuthors([...result])
      if (queryType === 'shouts') {
        setAuthorsByShouts((prev) => [...(prev || []), ...result])
      } else if (queryType === 'followers') {
        setAuthorsByFollowers((prev) => [...(prev || []), ...result])
      }
      setLoading(false)
    }
  }

  const loadMoreAuthors = () => {
    const nextPage = currentPage()[props.query] + 1
    fetchAuthors(props.query, nextPage).then(() =>
      setCurrentPage({ ...currentPage(), [props.query]: nextPage })
    )
  }

  createEffect(
    on(
      () => props.query,
      (query) => {
        const al = query === 'shouts' ? authorsByShouts() : authorsByFollowers()
        if (al?.length === 0 && currentPage()[query] === 0) {
          setCurrentPage((prev) => ({ ...prev, [query]: 0 }))
          fetchAuthors(query, 0).then(() => setCurrentPage((prev) => ({ ...prev, [query]: 1 })))
        }
      }
    )
  )

  const authorsList = () => (props.query === 'shouts' ? authorsByShouts() : authorsByFollowers())
  createEffect(() => setAllLoaded(props.allAuthorsLength === authorsList.length))

  return (
    <div class={clsx(styles.AuthorsList, props.class)}>
      <For each={authorsList()}>
        {(author) => (
          <div class="row">
            <div class="col-lg-20 col-xl-18">
              <AuthorBadge author={author} />
            </div>
          </div>
        )}
      </For>
      <div class="row">
        <div class="col-lg-20 col-xl-18">
          <div class={styles.action}>
            <Show when={!loading() && (authorsList()?.length || 0) > 0 && !allLoaded()}>
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
