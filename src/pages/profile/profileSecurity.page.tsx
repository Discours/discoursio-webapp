import { clsx } from 'clsx'

import { AuthGuard } from '../../components/AuthGuard'
import { ProfileSettingsNavigation } from '../../components/Nav/ProfileSettingsNavigation'
import { Icon } from '../../components/_shared/Icon'
import { PageLayout } from '../../components/_shared/PageLayout'
import { useLocalize } from '../../context/localize'

import { UpdateProfileInput } from '@authorizerdev/authorizer-js'
import { Show, createEffect, createSignal } from 'solid-js'
import { PasswordField } from '../../components/Nav/AuthModal/PasswordField'
import { useSession } from '../../context/session'
import { useSnackbar } from '../../context/snackbar'
import { DEFAULT_HEADER_OFFSET } from '../../stores/router'
import { validateEmail } from '../../utils/validateEmail'
import styles from './Settings.module.scss'

export const ProfileSecurityPage = () => {
  const { t } = useLocalize()
  const { updateProfile, session } = useSession()
  const { showSnackbar } = useSnackbar()

  const [oldPassword, setOldPassword] = createSignal<string | undefined>()
  const [newPassword, setNewPassword] = createSignal<string | undefined>()
  const [email, setEmail] = createSignal<string | undefined>()
  const [newPasswordError, setNewPasswordError] = createSignal<string | undefined>()
  const [oldPasswordError, setOldPasswordError] = createSignal<string | undefined>()
  const [isSubmitting, setIsSubmitting] = createSignal<boolean>()
  const [emailError, setEmailError] = createSignal<string | undefined>()

  const oldPasswordRef: { current: HTMLDivElement } = { current: null }
  const handleCheckNewPassword = (value: string) => {
    if (value !== newPassword()) {
      setNewPasswordError(t('Passwords are not equal'))
    }
  }

  createEffect(() => {
    if (session()?.user?.email) {
      setEmail(session().user.email)
    }
  })

  const handleChangeEmail = (value: string) => {
    setEmailError()
    setEmail(value.trim())
  }
  const handleSubmit = async () => {
    setIsSubmitting(true)
    if (!validateEmail(email())) {
      setEmailError(t('Invalid email'))
      return
    }

    const options: UpdateProfileInput = {
      old_password: oldPassword(),
      new_password: newPassword() || oldPassword(),
      confirm_new_password: newPassword() || oldPassword(),
      email: email() || session()?.user.email,
    }

    try {
      const { errors } = await updateProfile(options)
      if (errors.length > 0) {
        console.error(errors)
        if (errors.some((obj) => obj.message === 'incorrect old password')) {
          setOldPasswordError(t('Incorrect old password'))
          showSnackbar({ type: 'error', body: t('Incorrect old password') })
          const rect = oldPasswordRef.current.getBoundingClientRect()
          const topPosition = window.scrollY + rect.top - DEFAULT_HEADER_OFFSET * 2
          window.scrollTo({
            top: topPosition,
            left: 0,
            behavior: 'smooth',
          })
        }
        return
      }
      showSnackbar({ type: 'success', body: t('Profile successfully saved') })
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
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
                      <input
                        type="text"
                        name="email"
                        id="email"
                        value={email()}
                        placeholder={t('Email')}
                        onFocus={() => setEmailError()}
                        onInput={(event) => handleChangeEmail(event.target.value)}
                      />
                      <label for="email">{t('Email')}</label>
                      <Show when={emailError()}>
                        <div
                          class={clsx(styles.emailValidationError, {
                            'form-message--error': emailError(),
                          })}
                        >
                          {emailError()}
                        </div>
                      </Show>
                    </div>

                    <h4>{t('Change password')}</h4>
                    <h5>{t('Current password')}</h5>

                    <div ref={(el) => (oldPasswordRef.current = el)}>
                      <PasswordField
                        onFocus={() => setOldPasswordError()}
                        setError={oldPasswordError()}
                        onInput={(value) => setOldPassword(value)}
                      />
                    </div>

                    <h5>{t('New password')}</h5>
                    <PasswordField onInput={(value) => setNewPassword(value)} />

                    <h5>{t('Confirm your new password')}</h5>
                    <PasswordField
                      noValidate={true}
                      onFocus={() => setNewPasswordError()}
                      setError={newPasswordError()}
                      onInput={(value) => handleCheckNewPassword(value)}
                    />

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
                      <button
                        class="button button--submit"
                        type="button"
                        disabled={isSubmitting() || Boolean(newPasswordError())}
                        onClick={handleSubmit}
                      >
                        {isSubmitting() ? t('Saving...') : t('Save settings')}
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
