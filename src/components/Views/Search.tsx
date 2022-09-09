import { Show, For, createSignal, createMemo } from 'solid-js'
import '../../styles/Search.scss'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from '../Feed/Card'
import { sortBy } from '../../utils/sortby'
import { t } from '../../utils/intl'
import { by, setBy } from '../../stores/router'
import { useArticlesStore } from '../../stores/zine/articles'

type Props = {
  results: Shout[]
}

export const SearchPage = (props: Props) => {
  const { getSortedArticles } = useArticlesStore({ sortedArticles: props.results })

  // FIXME server sort
  // const [q, setq] = createSignal(props?.q || '')
  // const articles = createMemo(() => {
  //   const sorted = sortBy(articles(), by() || byRelevance)
  //   return q().length > 3
  //     ? sorted.filter(
  //         (a) =>
  //           a.title?.toLowerCase().includes(q().toLowerCase()) ||
  //           a.body?.toLowerCase().includes(q().toLowerCase())
  //       )
  //     : sorted
  // })
  //
  // function handleQueryChange(ev) {
  //   const el = ev.target as HTMLInputElement
  //   const query = el.value
  //   setq(query)
  // }
  //
  // function handleSubmit(ev) {
  //   ev.preventDefault()
  //   const el = ev.target as HTMLInputElement
  //   const query = el.value
  //   setq(query)
  //   setBy('')
  // }

  return (
    <div class="search-page wide-container">
      <form action="/search" class="search-form row">
        <div class="col-sm-9">
          {/*FIXME*/}
          {/*<input type="search" name="q" onChange={handleQueryChange} placeholder="Введите текст..." />*/}
          <input type="search" name="q" placeholder="Введите текст..." />
        </div>
        <div class="col-sm-3">
          {/*FIXME*/}
          {/*<button class="button" type="submit" onClick={handleSubmit}>*/}
          {/*  {t('Search')}*/}
          {/*</button>*/}
          <button class="button" type="submit">
            {t('Search')}
          </button>
        </div>
      </form>

      <ul class="view-switcher">
        <li class="selected">
          <a href="?by=relevance" onClick={() => setBy('relevance')}>
            {t('By relevance')}
          </a>
        </li>
        <li>
          <a href="?by=rating" onClick={() => setBy('rating')}>
            {t('Top rated')}
          </a>
        </li>
      </ul>

      <Show when={getSortedArticles().length > 0}>
        <h3>{t('Publications')}</h3>

        <div class="floor">
          <div class="row">
            <For each={getSortedArticles()}>
              {(article) => (
                <div class="col-md-3">
                  <ArticleCard article={article} />
                </div>
              )}
            </For>

            <div class="col-md-3">
              <a href="#" class="search__show-more">
                <span class="search__show-more-inner">{t('Load more')}</span>
              </a>
            </div>
          </div>
        </div>

        <h3>{t('Topics')}</h3>

        <h3>{t('Authors')}</h3>
      </Show>
    </div>
  )
}
