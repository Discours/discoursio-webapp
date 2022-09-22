import { Show, For, createSignal, createMemo } from 'solid-js'
import styles from '../../styles/Search.module.scss'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from '../Feed/Card'
import { t } from '../../utils/intl'
import { params } from '../../stores/router'
import { useArticlesStore, loadSearchResults } from '../../stores/zine/articles'
import { useStore } from '@nanostores/solid'
import clsx from 'clsx'

type Props = {
  query?: string
  results?: Shout[]
}

export const SearchPage = (props: Props) => {
  const args = useStore(params)
  const { getSortedArticles } = useArticlesStore({ sortedArticles: props.results })
  const [getQuery, setQuery] = createSignal(props.query)

  const handleQueryChange = (ev) => {
    setQuery(ev.target.value)
  }

  const handleSubmit = (_ev) => {
    // TODO page
    // TODO sort
    loadSearchResults({ query: getQuery() })
  }

  return (
    <div class="search-page wide-container">
      <div class="shift-content">
        <form action="/search" class={clsx(styles.searchForm, 'row')}>
          <div class="col-sm-8">
            {/*FIXME t*/}
            <input
              class={styles.searchFormInput}
              type="search"
              name="q"
              onChange={handleQueryChange}
              placeholder="Введите текст..."
            />
          </div>
          <div class="col-sm-4">
            <button class={clsx(styles.searchFormButton, 'button')} type="submit" onClick={handleSubmit}>
              {t('Search action')}
            </button>
          </div>
        </form>

        <div class="row">
          <div class="col-md-8">
            <ul class="view-switcher">
              <li class="selected">
                <a href="?by=relevance" onClick={() => (args()['by'] = 'relevance')}>
                  {t('By relevance')}
                </a>
              </li>
              <li>
                <a href="?by=rating" onClick={() => (args()['by'] = 'rating')}>
                  {t('Top rated')}
                </a>
              </li>
            </ul>

            <Show when={getSortedArticles().length > 0}>
              <h3>{t('Publications')}</h3>

              <div class="floor">
                <div class="row">
                  <For each={getSortedArticles()}>
                    {(article) => <ArticleCard article={article} settings={{ isSearchMode: true }} />}
                  </For>

                  <div class="col-md-3">
                    <a href="#" class={clsx(styles.searchShowMore)}>
                      <span class={clsx(styles.searchShowMoreInner)}>{t('Load more')}</span>
                    </a>
                  </div>
                </div>
              </div>

              <h3>{t('Topics')}</h3>

              <h3>{t('Authors')}</h3>
            </Show>
          </div>

          <div class={clsx(styles.searchSettings, 'col-md-4')}>
            <form action=".">
              <section class={styles.searchSettingsSection}>
                <h4>Период времени</h4>
                <div class={clsx(styles.radioTabs, 'radio-tabs')}>
                  <input type="radio" name="period" id="period-yesterday" checked={true} />
                  <label for="period-yesterday">Вчера</label>
                  <input type="radio" name="period" id="period-week" />
                  <label for="period-week">Неделю</label>
                  <input type="radio" name="period" id="period-month" />
                  <label for="period-month">Месяц</label>
                  <input type="radio" name="period" id="period-year" />
                  <label for="period-year">Год</label>
                  <input type="radio" name="period" id="period-exact" />
                  <label for="period-exact">Точно</label>
                </div>
                <div class={styles.exactRange}>
                  <label for="period-min" class={styles.exactRangeLabel}>
                    от
                  </label>
                  <input type="date" name="period-min" id="period-min" class={styles.exactRangeInput} />
                  <label for="period-max" class={styles.exactRangeLabel}>
                    до
                  </label>
                  <input type="date" name="period-max" id="period-max" class={styles.exactRangeInput} />
                </div>
              </section>

              <section class={styles.searchSettingsSection}>
                <h4>Рейтинг</h4>
                <div class={clsx(styles.radioTabs, 'radio-tabs')}>
                  <input
                    type="radio"
                    name="rating"
                    id="rating-0"
                    class={clsx(styles.input)}
                    checked={true}
                  />
                  <label for="rating-0">от 0</label>
                  <input type="radio" name="rating" id="rating-50" />
                  <label for="rating-50">от 50</label>
                  <input type="radio" name="rating" id="rating-100" />
                  <label for="rating-100">от 100</label>
                  <input type="radio" name="rating" id="rating-300" />
                  <label for="rating-300">от 300</label>
                  <input type="radio" name="rating" id="rating-exact" />
                  <label for="rating-exact">Точно</label>
                </div>
                <div class={styles.exactRange}>
                  <label for="rating-min" class={styles.exactRangeLabel}>
                    от
                  </label>
                  <input
                    type="number"
                    name="rating-min"
                    id="rating-min"
                    value="300"
                    class={styles.exactRangeInput}
                  />
                  <label for="rating-max" class={styles.exactRangeLabel}>
                    до
                  </label>
                  <input
                    type="number"
                    name="rating-max"
                    id="rating-max"
                    value="500"
                    class={styles.exactRangeInput}
                  />
                </div>
              </section>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
