import { PageLayout } from '../../components/_shared/PageLayout'
import styles from './Settings.module.scss'
import { Icon } from '../../components/_shared/Icon'
import { clsx } from 'clsx'
import ProfileSettingsNavigation from '../../components/Discours/ProfileSettingsNavigation'

export const ProfileSecurityPage = () => {
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
                      type="text"
                      name="password-current"
                      id="password-current"
                      class={clsx(styles.passwordInput, 'nolabel')}
                    />
                    <button type="button" class={styles.passwordToggleControl}>
                      <Icon name="password-hide" />
                    </button>
                  </div>

                  <h5>Новый пароль</h5>
                  <div class="pretty-form__item">
                    <input
                      type="password"
                      name="password-new"
                      id="password-new"
                      class={clsx(styles.passwordInput, 'nolabel')}
                    />
                    <button type="button" class={styles.passwordToggleControl}>
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
                    <button type="button" class={styles.passwordToggleControl}>
                      <Icon name="password-open" />
                    </button>
                  </div>

                  <h4>Социальные сети</h4>
                  <h5>Google</h5>
                  <div class="pretty-form__item">
                    <p>
                      <button class={clsx('button', 'button--light', styles.socialButton)} type="button">
                        <Icon name="google" class={styles.icon} />
                        Привязать
                      </button>
                    </p>
                  </div>

                  <h5>VK</h5>
                  <div class="pretty-form__item">
                    <p>
                      <button class={clsx(styles.socialButton, 'button', 'button--light')} type="button">
                        <Icon name="vk" class={styles.icon} />
                        Привязать
                      </button>
                    </p>
                  </div>

                  <h5>Facebook</h5>
                  <div class="pretty-form__item">
                    <p>
                      <button class={clsx(styles.socialButton, 'button', 'button--light')} type="button">
                        <Icon name="facebook" class={styles.icon} />
                        Привязать
                      </button>
                    </p>
                  </div>

                  <h5>Apple</h5>
                  <div class="pretty-form__item">
                    <p>
                      <button
                        class={clsx(
                          styles.socialButton,
                          styles.socialButtonApple,
                          'button' + ' button--light'
                        )}
                        type="button"
                      >
                        <Icon name="apple" class={styles.icon} />
                        Привязать
                      </button>
                    </p>
                  </div>

                  <br />
                  <p>
                    <button class="button button--submit" type="submit">
                      Сохранить настройки
                    </button>
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

export const Page = ProfileSecurityPage
