import type { Author } from '../../../graphql/schema/core.gen'

import { Meta } from '@solidjs/meta'
import { clsx } from 'clsx'
import { For, Show, createMemo, createSignal } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useRouter } from '../../../stores/router'
import { useAuthorsStore } from '../../../stores/zine/authors'
import { getImageUrl } from '../../../utils/getImageUrl'
import { scrollHandler } from '../../../utils/scroll'
import { authorLetterReduce, translateAuthor } from '../../../utils/translate'

import { AuthorsList } from '../../AuthorsList'
import { Loading } from '../../_shared/Loading'
import { SearchField } from '../../_shared/SearchField'

import styles from './AllAuthors.module.scss'

type AllAuthorsPageSearchParams = {
  by: '' | 'name' | 'shouts' | 'followers'
}

type Props = {
  authors: Author[]
  topFollowedAuthors?: Author[]
  topWritingAuthors?: Author[]
  isLoaded: boolean
}

export const AllAuthors = (props: Props) => {
  const { t, lang } = useLocalize()
  const [searchQuery, setSearchQuery] = createSignal('')
  const ALPHABET =
    lang() === 'ru' ? [...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ@'] : [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ@']
  const { searchParams } = useRouter<AllAuthorsPageSearchParams>()
  const { sortedAuthors } = useAuthorsStore({
    authors: props.authors,
    sortBy: searchParams().by || 'name',
  })

  const filteredAuthors = createMemo(() => {
    const query = searchQuery().toLowerCase()
    return sortedAuthors().filter((author) => {
      return author.name.toLowerCase().includes(query) // Предполагаем, что у автора есть свойство name
    })
  })

  const byLetterFiltered = createMemo<{ [letter: string]: Author[] }>(() => {
    return filteredAuthors().reduce(
      (acc, author) => authorLetterReduce(acc, author, lang()),
      {} as { [letter: string]: Author[] },
    )
  })

  const sortedKeys = createMemo<string[]>(() => {
    const keys = Object.keys(byLetterFiltered())
    keys.sort()
    keys.push(keys.shift())
    return keys
  })

  const ogImage = getImageUrl('production/image/logo_image.png')
  const ogTitle = t('Authors')
  const description = t('List of authors of the open editorial community')

  return (
    <div class={clsx(styles.allAuthorsPage, 'wide-container')}>
      <Meta name="descprition" content={description} />
      <Meta name="keywords" content={t('keywords')} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle} />
      <Meta name="og:image" content={ogImage} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="og:description" content={description} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle} />
      <Meta name="twitter:description" content={description} />
      <Show when={props.isLoaded} fallback={<Loading />}>
        <div class="offset-md-5">
          <div class="row">
            <div class="col-lg-20 col-xl-18">
              <h1>{t('Authors')}</h1>
              <p>{t('Subscribe who you like to tune your personal feed')}</p>
              <ul class={clsx(styles.viewSwitcher, 'view-switcher')}>
                <li
                  class={clsx({
                    ['view-switcher__item--selected']: !searchParams().by || searchParams().by === 'shouts',
                  })}
                >
                  <a href="/authors?by=shouts">{t('By shouts')}</a>
                </li>
                <li
                  class={clsx({
                    ['view-switcher__item--selected']: searchParams().by === 'followers',
                  })}
                >
                  <a href="/authors?by=followers">{t('By popularity')}</a>
                </li>
                <li
                  class={clsx({
                    ['view-switcher__item--selected']: searchParams().by === 'name',
                  })}
                >
                  <a href="/authors?by=name">{t('By name')}</a>
                </li>
                <Show when={searchParams().by === 'name'}>
                  <li class="view-switcher__search">
                    <SearchField onChange={(value) => setSearchQuery(value)} />
                  </li>
                </Show>
              </ul>
            </div>
          </div>

          <Show when={searchParams().by === 'name'}>
            <div class="row">
              <div class="col-lg-20 col-xl-18">
                <ul class={clsx('nodash', styles.alphabet)}>
                  <For each={ALPHABET}>
                    {(letter, index) => (
                      <li>
                        <Show when={letter in byLetterFiltered()} fallback={letter}>
                          <a
                            href={`/authors?by=name#letter-${index()}`}
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
            <For each={sortedKeys()}>
              {(letter) => (
                <div class={clsx(styles.group, 'group')}>
                  <h2 id={`letter-${ALPHABET.indexOf(letter)}`}>{letter}</h2>
                  <div class="container">
                    <div class="row">
                      <div class="col-lg-20">
                        <div class="row">
                          <For each={byLetterFiltered()[letter]}>
                            {(author) => (
                              <div class={clsx(styles.topic, 'topic col-sm-12 col-md-8')}>
                                <div class="topic-title">
                                  <a href={`/author/${author.slug}`}>{translateAuthor(author, lang())}</a>
                                  <Show when={author.stat}>
                                    <span class={styles.articlesCounter}>{author.stat.shouts}</span>
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
          <Show when={searchParams().by !== 'name' && props.isLoaded}>
            <AuthorsList
              allAuthorsLength={sortedAuthors()?.length}
              searchQuery={searchQuery()}
              query={searchParams().by === 'followers' ? 'followers' : 'shouts'}
            />
          </Show>
        </div>
      </Show>
    </div>
  )
}
