import { PageLayout } from '../../components/_shared/PageLayout'
import styles from './Settings.module.scss'
import stylesSettings from '../../styles/FeedSettings.module.scss'
import { clsx } from 'clsx'
import ProfileSettingsNavigation from '../../components/Discours/ProfileSettingsNavigation'
import { SearchField } from '../../components/_shared/SearchField'

export const ProfileSubscriptionsPage = () => {
  return (
    <PageLayout>
      <div class="wide-container">
        <div class="row">
          <div class="col-md-5">
            <div class={clsx('left-navigation', styles.leftNavigation)}>
              <ProfileSettingsNavigation />
            </div>
          </div>

          <div class="col-md-19">
            <div class="row">
              <div class="col-md-20 col-lg-18 col-xl-16">
                <h1>Подписки</h1>
                <p class="description">Здесь можно управлять всеми своими подписками на&nbsp;сайте.</p>

                <form>
                  <ul class="view-switcher">
                    <li class="selected">
                      <a href="src/components/Pages/profile#">Все</a>
                    </li>
                    <li>
                      <a href="src/components/Pages/profile#">Авторы</a>
                    </li>
                    <li>
                      <a href="src/components/Pages/profile#">Темы</a>
                    </li>
                    <li>
                      <a href="src/components/Pages/profile#">Сообщества</a>
                    </li>
                    <li>
                      <a href="src/components/Pages/profile#">Коллекции</a>
                    </li>
                  </ul>

                  <div class={clsx('pretty-form__item', styles.searchContainer)}>
                    <SearchField onChange={() => console.log('nothing')} class={styles.searchField} />
                  </div>

                  <div class={clsx(stylesSettings.settingsList, styles.topicsList)}>
                    <div class={stylesSettings.settingsListRow}>
                      <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                        <input type="checkbox" name="checkbox1" id="checkbox1" />
                        <label for="checkbox1" />
                      </div>
                      <label for="checkbox1" class={stylesSettings.settingsListCell}>
                        Культура
                      </label>
                    </div>
                    <div class={stylesSettings.settingsListRow}>
                      <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                        <input type="checkbox" name="checkbox2" id="checkbox2" />
                        <label for="checkbox2" />
                      </div>
                      <label for="checkbox2" class={stylesSettings.settingsListCell}>
                        Eto_ya sam
                      </label>
                    </div>
                    <div class={stylesSettings.settingsListRow}>
                      <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                        <input type="checkbox" name="checkbox3" id="checkbox3" />
                        <label for="checkbox3" />
                      </div>
                      <label for="checkbox3" class={stylesSettings.settingsListCell}>
                        Технопарк
                      </label>
                    </div>
                    <div class={stylesSettings.settingsListRow}>
                      <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                        <input type="checkbox" name="checkbox4" id="checkbox4" />
                        <label for="checkbox4" />
                      </div>
                      <label for="checkbox4" class={stylesSettings.settingsListCell}>
                        Лучшее
                      </label>
                    </div>
                    <div class={stylesSettings.settingsListRow}>
                      <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                        <input type="checkbox" name="checkbox5" id="checkbox5" />
                        <label for="checkbox5" />
                      </div>
                      <label for="checkbox5" class={stylesSettings.settingsListCell}>
                        Реклама
                      </label>
                    </div>
                    <div class={stylesSettings.settingsListRow}>
                      <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                        <input type="checkbox" name="checkbox6" id="checkbox6" />
                        <label for="checkbox6" />
                      </div>
                      <label for="checkbox6" class={stylesSettings.settingsListCell}>
                        Искусство
                      </label>
                    </div>
                    <div class={stylesSettings.settingsListRow}>
                      <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                        <input type="checkbox" name="checkbox7" id="checkbox7" />
                        <label for="checkbox7" />
                      </div>
                      <label for="checkbox7" class={stylesSettings.settingsListCell}>
                        Общество
                      </label>
                    </div>
                    <div class={stylesSettings.settingsListRow}>
                      <div class={clsx(stylesSettings.settingsListCell, styles.topicsListItem)}>
                        <input type="checkbox" name="checkbox8" id="checkbox8" />
                        <label for="checkbox8" />
                      </div>
                      <label for="checkbox8" class={stylesSettings.settingsListCell}>
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
      </div>
    </PageLayout>
  )
}

export const Page = ProfileSubscriptionsPage
