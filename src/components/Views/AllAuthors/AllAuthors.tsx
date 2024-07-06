import { Meta } from '@solidjs/meta'
import { useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'
import { Loading } from '~/components/_shared/Loading'
import { SearchField } from '~/components/_shared/SearchField'
import { useAuthors } from '~/context/authors'
import { useLocalize } from '~/context/localize'
import type { Author } from '~/graphql/schema/core.gen'
import enKeywords from '~/intl/locales/en/keywords.json'
import ruKeywords from '~/intl/locales/ru/keywords.json'
import { authorLetterReduce, translateAuthor } from '~/intl/translate'
import { getImageUrl } from '~/lib/getImageUrl'
import { scrollHandler } from '~/utils/scroll'
import { AuthorsList } from '../../AuthorsList'
import styles from './AllAuthors.module.scss'

type Props = {
  authors: Author[]
  topFollowedAuthors?: Author[]
  topWritingAuthors?: Author[]
  isLoaded: boolean
}
export const AUTHORS_PER_PAGE = 20
export const ABC = {
  ru: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ#',
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'
}

export const AllAuthors = (props: Props) => {
  const { t, lang } = useLocalize()
  const [searchQuery, setSearchQuery] = createSignal('')
  const alphabet = createMemo(() => ABC[lang()] || ABC['ru'])
  const [searchParams, changeSearchParams] = useSearchParams<{ by?: string }>()
  const { authorsSorted, addAuthors, setAuthorsSort } = useAuthors()

  onMount(() => !searchParams?.by && changeSearchParams({ by: 'name' }))
  createEffect(on(() => searchParams?.by || 'name', setAuthorsSort || ((_) => null), {}))
  createEffect(on(() => props.authors || [], addAuthors || ((_) => null), {}))

  const filteredAuthors = createMemo(() => {
    const query = searchQuery().toLowerCase()
    return authorsSorted?.()?.filter((a: Author) => a?.name?.toLowerCase().includes(query)) || []
  })

  const byLetterFiltered = createMemo<{ [letter: string]: Author[] }>(() => {
    return (
      filteredAuthors()?.reduce(
        (acc, author: Author) => authorLetterReduce(acc, author, lang()),
        {} as { [letter: string]: Author[] }
      ) || {}
    )
  })

  const sortedKeys = createMemo<string[]>(() => {
    const keys = Object.keys(byLetterFiltered() || {})
    keys.sort()
    const fk = keys.shift() || ''
    fk && keys.push(fk)
    return keys
  })

  const ogImage = createMemo(() => getImageUrl('production/image/logo_image.png'))
  const ogTitle = createMemo(() => t('Authors'))
  const description = createMemo(() => t('List of authors of the open editorial community'))

  return (
    <div class={clsx(styles.allAuthorsPage, 'wide-container')}>
      <Meta name="descprition" content={description() || ''} />
      <Meta name="keywords" content={lang() === 'ru' ? ruKeywords[''] : enKeywords['']} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle() || ''} />
      <Meta name="og:image" content={ogImage() || ''} />
      <Meta name="twitter:image" content={ogImage() || ''} />
      <Meta name="og:description" content={description() || ''} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle() || ''} />
      <Meta name="twitter:description" content={description() || ''} />
      <Show when={props.isLoaded} fallback={<Loading />}>
        <div class="offset-md-5">
          <div class="row">
            <div class="col-lg-20 col-xl-18">
              <h1>{t('Authors')}</h1>
              <p>{t('Subscribe who you like to tune your personal feed')}</p>
              <ul class={clsx(styles.viewSwitcher, 'view-switcher')}>
                <li
                  class={clsx({
                    ['view-switcher__item--selected']: !searchParams?.by || searchParams?.by === 'shouts'
                  })}
                >
                  <a href="/author?by=shouts">{t('By shouts')}</a>
                </li>
                <li
                  class={clsx({
                    ['view-switcher__item--selected']: searchParams?.by === 'followers'
                  })}
                >
                  <a href="/author?by=followers">{t('By popularity')}</a>
                </li>
                <li
                  class={clsx({
                    ['view-switcher__item--selected']: searchParams?.by === 'name'
                  })}
                >
                  <a href="/author?by=name">{t('By name')}</a>
                </li>
                <Show when={searchParams?.by === 'name'}>
                  <li class="view-switcher__search">
                    <SearchField onChange={(value) => setSearchQuery(value)} />
                  </li>
                </Show>
              </ul>
            </div>
          </div>

          <Show when={searchParams?.by === 'name'}>
            <div class="row">
              <div class="col-lg-20 col-xl-18">
                <ul class={clsx('nodash', styles.alphabet)}>
                  <For each={[...(alphabet() || [])]}>
                    {(letter, index) => (
                      <li>
                        <Show when={letter in byLetterFiltered()} fallback={letter}>
                          <a
                            href={`/author?by=name#letter-${index()}`}
                            onClick={(event) => {
                              event.preventDefault()
                              scrollHandler(`letter-${index()}`)
                            }}
                          >
                            {letter}
                          </a>
                        </Show>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </div>
            <For each={sortedKeys() || []}>
              {(letter) => (
                <div class={clsx(styles.group, 'group')}>
                  <h2 id={`letter-${alphabet()?.indexOf(letter) || ''}`}>{letter}</h2>
                  <div class="container">
                    <div class="row">
                      <div class="col-lg-20">
                        <div class="row">
                          <For each={byLetterFiltered()?.[letter] || []}>
                            {(author) => (
                              <div class={clsx(styles.topic, 'topic col-sm-12 col-md-8')}>
                                <div class="topic-title">
                                  <a href={`/author/${author.slug}`}>{translateAuthor(author, lang())}</a>
                                  <Show when={author.stat?.shouts || 0}>
                                    <span class={styles.articlesCounter}>{author.stat?.shouts || 0}</span>
                                  </Show>
                                </div>
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </Show>
          <Show when={searchParams?.by !== 'name' && props.isLoaded}>
            <AuthorsList
              allAuthorsLength={authorsSorted?.()?.length || 0}
              searchQuery={searchQuery()}
              query={searchParams?.by === 'followers' ? 'followers' : 'shouts'}
            />
          </Show>
        </div>
      </Show>
    </div>
  )
}
