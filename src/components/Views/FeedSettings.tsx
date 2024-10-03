import { useLocalize } from '~/context/localize'

import styles from '~/styles/views/FeedSettings.module.scss'

// type FeedSettingsSearchParams = {
//   by: '' | 'topics' | 'authors' | 'shouts'
// }

export const FeedSettingsView = () => {
  const { t } = useLocalize()
  return (
    <div class="container">
      <h1>{t('Feed settings')}</h1>

      <ul class="view-switcher">
        <li class="view-switcher__item--selected">
          <a href="?by=topics">{t('Topics').toLocaleLowerCase()}</a>
        </li>
        {/*<li>
          <a href="?by=collections" onClick={() => setBy('collections')}>
            {t('Collections').toLocaleLowerCase()}
          </a>
        </li>*/}
        <li>
          <a href="?by=authors">{t('Authors').toLocaleLowerCase()}</a>
        </li>
        <li>
          <a href="?by=shouts">{t('Publications').toLocaleLowerCase()}</a>
        </li>
      </ul>

      <div class={styles.settingsList}>
        <div>
          <h2>Общее</h2>
        </div>

        <div>
          <label for="checkbox1">Комментарии к моим постам</label>
          <div>
            <input type="checkbox" name="checkbox1" id="checkbox1" />
            <label for="checkbox1" />
          </div>
          <div>
            <input
              type="checkbox"
              name="checkbox1-notification"
              id="checkbox1-notification"
              class="notifications-checkbox"
            />
            <label for="checkbox1-notification" />
          </div>
        </div>

        <div>
          <label for="checkbox2">новые подписчики</label>
          <div>
            <input type="checkbox" name="checkbox2" id="checkbox2" />
            <label for="checkbox2" />
          </div>
          <div>
            <input
              type="checkbox"
              name="checkbox2-notification"
              id="checkbox2-notification"
              class="notifications-checkbox"
            />
            <label for="checkbox2-notification" />
          </div>
        </div>

        <div>
          <label for="checkbox3">добавление моих текстов в коллекции</label>
          <div>
            <input type="checkbox" name="checkbox3" id="checkbox3" />
            <label for="checkbox3" />
          </div>
          <div>
            <input
              type="checkbox"
              name="checkbox3-notification"
              id="checkbox3-notification"
              class="notifications-checkbox"
            />
            <label for="checkbox3-notification" />
          </div>
        </div>

        <div>
          <h2>Мои подписки</h2>
        </div>

        <div>
          <label for="checkbox4">добавление моих текстов в коллекции</label>
          <div>
            <input type="checkbox" name="checkbox4" id="checkbox4" />
            <label for="checkbox4" />
          </div>
          <div>
            <input
              type="checkbox"
              name="checkbox4-notification"
              id="checkbox4-notification"
              class="notifications-checkbox"
            />
            <label for="checkbox4-notification" />
          </div>
        </div>
      </div>
    </div>
  )
}
