import { PageWrap } from '../../_shared/PageWrap'
import type { PageProps } from '../../types'
import styles from './Settings.module.scss'
import { Icon } from '../../_shared/Icon'
import { clsx } from 'clsx'
import ProfileSettingsNavigation from '../../Discours/ProfileSettingsNavigation'

export const ProfileSecurityPage = (props: PageProps) => {
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
              <h1>Вход и&nbsp;безопасность</h1>
              <p class="description">Настройки аккаунта, почты, пароля и&nbsp;способов входа.</p>

              <form>
                <h4>Почта</h4>
                <div class="pretty-form__item">
                  <input type="text" name="email" id="email" placeholder="Почта" />
                  <label for="email">Почта</label>
                </div>

                <h4>Изменить пароль</h4>
                <h5>Текущий пароль</h5>
                <div class="pretty-form__item">
                  <input
                    type="password"
                    name="password-current"
                    id="password-current"
                    class={clsx(styles.passwordInput, 'nolabel')}
                  />
                  <button class={styles.passwordToggleControl}>
                    <Icon name="password-open" />
                  </button>
                </div>

                <h5>Текущий пароль</h5>
                <div class="pretty-form__item">
                  <input
                    type="password"
                    name="password-new"
                    id="password-new"
                    class={clsx(styles.passwordInput, 'nolabel')}
                  />
                  <button class={styles.passwordToggleControl}>
                    <Icon name="password-open" />
                  </button>
                </div>

                <h5>Подтвердите новый пароль</h5>
                <div class="pretty-form__item">
                  <input
                    type="password"
                    name="password-new-confirm"
                    id="password-new-confirm"
                    class={clsx(styles.passwordInput, 'nolabel')}
                  />
                  <button class={styles.passwordToggleControl}>
                    <Icon name="password-open" />
                  </button>
                </div>

                <div class={clsx(styles.multipleControls, 'pretty-form__item')}>
                  <div class={styles.multipleControlsHeader}>
                    <h4>Социальные сети</h4>
                    <button class="button">+</button>
                  </div>
                  <div class={styles.multipleControlsItem}>
                    <input type="text" name="social1" class="nolabel" />
                    <button>
                      <Icon name="remove" class={styles.icon} />
                    </button>
                  </div>
                  <div class={styles.multipleControlsItem}>
                    <input type="text" name="social1" class="nolabel" />
                    <button>
                      <Icon name="remove" class={styles.icon} />
                    </button>
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
export default ProfileSecurityPage
