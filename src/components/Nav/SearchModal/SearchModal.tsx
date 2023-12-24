import { clsx } from 'clsx'
import { useLocalize } from '../../../context/localize'
import { Icon } from '../../_shared/Icon'

import styles from './SearchModal.module.scss'

export const SearchModal = () => {
  const { t } = useLocalize()
  let qElement: HTMLInputElement | undefined

  const submitQuery = async (ev) => {
    ev.preventDefault()
    window.history.pushState({}, '', '/search?q=' + qElement.value)
  }
  return (
    <form onSubmit={submitQuery} class={styles.searchForm}>
      <input
        type="text"
        name="q"
        placeholder={t('Site search')}
        ref={qElement}
        class={styles.searchField}
      />
      <button type="submit" class={styles.submitControl}>
        <Icon name="search" />
      </button>
      <p class={styles.searchDescription}>
        Для поиска публикаций, искусства, комментариев, интересных вам авторов и&nbsp;тем, просто начните
        вводить ваш запрос
      </p>

      <ul class={clsx('view-switcher', styles.filterSwitcher)}>
        <li class="view-switcher__item view-switcher__item--selected">
          <button type="button">{t('All')}</button>
        </li>
        <li class="view-switcher__item">
          <button type="button">{t('Publications')}</button>
        </li>
        <li class="view-switcher__item">
          <button type="button">{t('Topics')}</button>
        </li>
      </ul>

      <div class={styles.filterResults}>
        <button type="button" class={styles.filterResultsControl}>
          Период времени
        </button>
        <button type="button" class={styles.filterResultsControl}>
          Рейтинг
        </button>
        <button type="button" class={styles.filterResultsControl}>
          Тип постов
        </button>
        <button type="button" class={styles.filterResultsControl}>
          Темы
        </button>
        <button type="button" class={styles.filterResultsControl}>
          Авторы
        </button>
        <button type="button" class={styles.filterResultsControl}>
          Сообщества
        </button>
      </div>

      <div class="container-xl">
        <div class="row">
          <div class={clsx('col-md-18 offset-md-2', styles.topicsList)}>
            <button type="button" class={styles.topTopic}>
              За месяц
            </button>
            <button type="button" class={styles.topTopic}>
              #репортажи
            </button>
            <button type="button" class={styles.topTopic}>
              #интервью
            </button>
            <button type="button" class={styles.topTopic}>
              #культура
            </button>
            <button type="button" class={styles.topTopic}>
              #поэзия
            </button>
            <button type="button" class={styles.topTopic}>
              #теории
            </button>
            <button type="button" class={styles.topTopic}>
              #война в украине
            </button>
            <button type="button" class={styles.topTopic}>
              #общество
            </button>
            <button type="button" class={styles.topTopic}>
              #Экспериментальная Музыка
            </button>
            <button type="button" class={styles.topTopic}>
              Рейтинг 300+
            </button>
            <button type="button" class={styles.topTopic}>
              #Протесты
            </button>
            <button type="button" class={styles.topTopic}>
              Музыка
            </button>
            <button type="button" class={styles.topTopic}>
              #За линией Маннергейма
            </button>
            <button type="button" class={styles.topTopic}>
              Тесты
            </button>
            <button type="button" class={styles.topTopic}>
              Коллективные истории
            </button>
            <button type="button" class={styles.topTopic}>
              #личный опыт
            </button>
            <button type="button" class={styles.topTopic}>
              Тоня Самсонова
            </button>
            <button type="button" class={styles.topTopic}>
              #личный опыт
            </button>
            <button type="button" class={styles.topTopic}>
              #Секс
            </button>
            <button type="button" class={styles.topTopic}>
              Молоко Plus
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
