import { PageWrap } from '../../_shared/PageWrap'
import type { PageProps } from '../../types'
import styles from './Settings.module.scss'
import stylesSettings from '../../../styles/FeedSettings.module.scss'
import { Icon } from '../../_shared/Icon'
import { clsx } from 'clsx'
import ProfileSettingsNavigation from '../../Discours/ProfileSettingsNavigation'
import { SearchField } from '../../_shared/SearchField'

export const ProfileSubscriptionsPage = (props: PageProps) => {
  return (
    <PageWrap>
      <div class="wide-container">
        <div class="shift-content">
          <div class="left-col">
            <div class={clsx('left-navigation', styles.leftNavigation)}>
              <ProfileSettingsNavigation />
            </div>
          </div>

          <div class="row">
            <div class="col-md-10 col-lg-9 col-xl-8">
              <h1>Подписки</h1>
              <p class="description">Здесь можно управлять всеми своими подписками на&nbsp;сайте.</p>

              <form>
                <ul class="view-switcher">
                  <li class="selected">
                    <a href="#">Все</a>
                  </li>
                  <li>
                    <a href="#">Авторы</a>
                  </li>
                  <li>
                    <a href="#">Темы</a>
                  </li>
                  <li>
                    <a href="#">Сообщества</a>
                  </li>
                  <li>
                    <a href="#">Коллекции</a>
                  </li>
                </ul>

                <div class={clsx('pretty-form__item', styles.searchContainer)}>
                  <SearchField onChange={() => {}} class={styles.searchField} />
                </div>

                <div class={clsx(stylesSettings.settingsList, styles.topicsList)}>
                  <div class={stylesSettings.settingsListRow}>
                    <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                      <input type="checkbox" name="checkbox1" id="checkbox1" />
                      <label for="checkbox1" />
                    </div>
                    <label for="checkbox1" class={styles.settingsListCell}>
                      Культура
                    </label>
                  </div>
                  <div class={stylesSettings.settingsListRow}>
                    <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                      <input type="checkbox" name="checkbox2" id="checkbox2" />
                      <label for="checkbox2" />
                    </div>
                    <label for="checkbox2" class={styles.settingsListCell}>
                      Eto_ya sam
                    </label>
                  </div>
                  <div class={stylesSettings.settingsListRow}>
                    <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                      <input type="checkbox" name="checkbox3" id="checkbox3" />
                      <label for="checkbox3" />
                    </div>
                    <label for="checkbox3" class={styles.settingsListCell}>
                      Технопарк
                    </label>
                  </div>
                  <div class={stylesSettings.settingsListRow}>
                    <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                      <input type="checkbox" name="checkbox4" id="checkbox4" />
                      <label for="checkbox4" />
                    </div>
                    <label for="checkbox4" class={styles.settingsListCell}>
                      Лучшее
                    </label>
                  </div>
                  <div class={stylesSettings.settingsListRow}>
                    <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                      <input type="checkbox" name="checkbox5" id="checkbox5" />
                      <label for="checkbox5" />
                    </div>
                    <label for="checkbox5" class={styles.settingsListCell}>
                      Реклама
                    </label>
                  </div>
                  <div class={stylesSettings.settingsListRow}>
                    <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                      <input type="checkbox" name="checkbox6" id="checkbox6" />
                      <label for="checkbox6" />
                    </div>
                    <label for="checkbox6" class={styles.settingsListCell}>
                      Искусство
                    </label>
                  </div>
                  <div class={stylesSettings.settingsListRow}>
                    <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                      <input type="checkbox" name="checkbox7" id="checkbox7" />
                      <label for="checkbox7" />
                    </div>
                    <label for="checkbox7" class={styles.settingsListCell}>
                      Общество
                    </label>
                  </div>
                  <div class={stylesSettings.settingsListRow}>
                    <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                      <input type="checkbox" name="checkbox8" id="checkbox8" />
                      <label for="checkbox8" />
                    </div>
                    <label for="checkbox8" class={styles.settingsListCell}>
                      Личный опыт
                    </label>
                  </div>
                </div>

                <br />
                <p>
                  <button class="button button--submit">Сохранить настройки</button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageWrap>
  )
}

// for lazy loading
export default ProfileSubscriptionsPage
