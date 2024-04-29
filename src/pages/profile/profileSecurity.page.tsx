import { clsx } from 'clsx'

import { AuthGuard } from '../../components/AuthGuard'
import { ProfileSettingsNavigation } from '../../components/Nav/ProfileSettingsNavigation'
import { Icon } from '../../components/_shared/Icon'
import { PageLayout } from '../../components/_shared/PageLayout'
import { useLocalize } from '../../context/localize'

import styles from './Settings.module.scss'
import { EyedPasswordInput } from '../../components/_shared/EyedPasswordInput'
import { createEffect, createSignal } from 'solid-js'

export const ProfileSecurityPage = () => {
  const { t } = useLocalize()

  const [oldPassword, setOldPassword] = createSignal<string | undefined>()
  const [newPassword, setNewPassword] = createSignal<string | undefined>()
  const [error, setError] = createSignal<string | undefined>()

  const handleCheckNewPassword = (value: string) => {
    if (value !== newPassword()) {
      setError(t('Passwords are not equal'))
    }
  }
  return (
    <PageLayout title={t('Profile')}>
      <AuthGuard>
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
                  <h1>{t('Login and security')}</h1>
                  <p class="description">{t('Settings for account, email, password and login methods.')}</p>

                  <form>
                    <h4>{t('Email')}</h4>
                    <div class="pretty-form__item">
                      <input type="text" name="email" id="email" placeholder={t('Email')} />
                      <label for="email">{t('Email')}</label>
                    </div>

                    <h4>{t('Change password')}</h4>
                    <h5>{t('Current password')}</h5>

                    <EyedPasswordInput onInput={(value) => setOldPassword(value)} />

                    <h5>{t('New password')}</h5>
                    <EyedPasswordInput onInput={(value) => setNewPassword(value)} />

                    <h5>{t('Confirm your new password')}</h5>
                    <EyedPasswordInput error={error()} onInput={(value) => handleCheckNewPassword(value)} />

                    <h4>{t('Social networks')}</h4>
                    <h5>Google</h5>
                    <div class="pretty-form__item">
                      <p>
                        <button class={clsx('button', 'button--light', styles.socialButton)} type="button">
                          <Icon name="google" class={styles.icon} />
                          {t('Connect')}
                        </button>
                      </p>
                    </div>

                    <h5>VK</h5>
                    <div class="pretty-form__item">
                      <p>
                        <button class={clsx(styles.socialButton, 'button', 'button--light')} type="button">
                          <Icon name="vk" class={styles.icon} />
                          {t('Connect')}
                        </button>
                      </p>
                    </div>

                    <h5>Facebook</h5>
                    <div class="pretty-form__item">
                      <p>
                        <button class={clsx(styles.socialButton, 'button', 'button--light')} type="button">
                          <Icon name="facebook" class={styles.icon} />
                          {t('Connect')}
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
                            'button' + ' button--light',
                          )}
                          type="button"
                        >
                          <Icon name="apple" class={styles.icon} />
                          {t('Connect')}
                        </button>
                      </p>
                    </div>
                    <br />
                    <p>
                      <button class="button button--submit" type="submit">
                        {t('Save settings')}
                      </button>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    </PageLayout>
  )
}

export const Page = ProfileSecurityPage
