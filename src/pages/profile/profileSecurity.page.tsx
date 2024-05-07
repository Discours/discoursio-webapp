import { clsx } from 'clsx'

import { AuthGuard } from '../../components/AuthGuard'
import { ProfileSettingsNavigation } from '../../components/Nav/ProfileSettingsNavigation'
import { Icon } from '../../components/_shared/Icon'
import { PageLayout } from '../../components/_shared/PageLayout'
import { useLocalize } from '../../context/localize'

import { UpdateProfileInput } from '@authorizerdev/authorizer-js'
import { Show, createEffect, createSignal, on } from 'solid-js'
import { PasswordField } from '../../components/Nav/AuthModal/PasswordField'
import { Button } from '../../components/_shared/Button'
import { Loading } from '../../components/_shared/Loading'
import { useConfirm } from '../../context/confirm'
import { useSession } from '../../context/session'
import { useSnackbar } from '../../context/snackbar'
import { DEFAULT_HEADER_OFFSET } from '../../stores/router'
import { validateEmail } from '../../utils/validateEmail'
import styles from './Settings.module.scss'

type FormField = 'oldPassword' | 'newPassword' | 'newPasswordConfirm' | 'email'
export const ProfileSecurityPage = () => {
  const { t } = useLocalize()
  const { updateProfile, session, isSessionLoaded } = useSession()
  const { showSnackbar } = useSnackbar()
  const { showConfirm } = useConfirm()

  const [newPasswordError, setNewPasswordError] = createSignal<string | undefined>()
  const [oldPasswordError, setOldPasswordError] = createSignal<string | undefined>()
  const [emailError, setEmailError] = createSignal<string | undefined>()
  const [isSubmitting, setIsSubmitting] = createSignal<boolean>()
  const [isFloatingPanelVisible, setIsFloatingPanelVisible] = createSignal(false)

  const initialState = {
    oldPassword: undefined,
    newPassword: undefined,
    newPasswordConfirm: undefined,
    email: undefined,
  }
  const [formData, setFormData] = createSignal(initialState)
  const oldPasswordRef: { current: HTMLDivElement } = { current: null }

  createEffect(
    on(
      () => session()?.user?.email,
      () => {
        setFormData((prevData) => ({
          ...prevData,
          ['email']: session()?.user?.email,
        }))
      },
    ),
  )
  const handleInputChange = (name: FormField, value: string) => {
    if (name === 'email' || name === 'newPasswordConfirm') {
      setIsFloatingPanelVisible(true)
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleCancel = async () => {
    const isConfirmed = await showConfirm({
      confirmBody: t('Do you really want to reset all changes?'),
      confirmButtonVariant: 'primary',
      declineButtonVariant: 'secondary',
    })
    if (isConfirmed) {
      setEmailError()
      setFormData({
        ...initialState,
        ['email']: session()?.user?.email,
      })
      setIsFloatingPanelVisible(false)
    }
  }
  const handleChangeEmail = (_value: string) => {
    if (!validateEmail(formData()['email'])) {
      setEmailError(t('Invalid email'))
      return
    }
  }
  const handleCheckNewPassword = (value: string) => {
    handleInputChange('newPasswordConfirm', value)
    if (value !== formData()['newPassword']) {
      setNewPasswordError(t('Passwords are not equal'))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const options: UpdateProfileInput = {
      old_password: formData()['oldPassword'],
      new_password: formData()['newPassword'] || formData()['oldPassword'],
      confirm_new_password: formData()['newPassword']() || formData()['oldPassword'],
      email: formData()['email'],
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
        <Show when={isSessionLoaded()} fallback={<Loading />}>
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
                    <p class="description">
                      {t('Settings for account, email, password and login methods.')}
                    </p>

                    <form>
                      <h4>{t('Email')}</h4>
                      <div class="pretty-form__item">
                        <input
                          type="text"
                          name="email"
                          id="email"
                          disabled={isSubmitting()}
                          value={formData()['email']}
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
                          onInput={(value) => handleInputChange('oldPassword', value)}
                          value={formData()['oldPassword'] ?? null}
                          disabled={isSubmitting()}
                        />
                      </div>

                      <h5>{t('New password')}</h5>
                      <PasswordField
                        onInput={(value) => {
                          handleInputChange('newPassword', value)
                          handleInputChange('newPasswordConfirm', null)
                        }}
                        value={formData()['newPassword'] ?? ''}
                        disabled={isSubmitting()}
                        disableAutocomplete={true}
                      />

                      <h5>{t('Confirm your new password')}</h5>
                      <PasswordField
                        noValidate={true}
                        value={
                          formData()['newPasswordConfirm']?.length > 0
                            ? formData()['newPasswordConfirm']
                            : null
                        }
                        onFocus={() => setNewPasswordError()}
                        setError={newPasswordError()}
                        onInput={(value) => handleCheckNewPassword(value)}
                        disabled={isSubmitting()}
                        disableAutocomplete={true}
                      />
                      <h4>{t('Social networks')}</h4>
                      <h5>Google</h5>
                      <div class="pretty-form__item">
                        <p>
                          <button
                            class={clsx('button', 'button--light', styles.socialButton)}
                            type="button"
                          >
                            <Icon name="google" class={styles.icon} />
                            {t('Connect')}
                          </button>
                        </p>
                      </div>

                      <h5>VK</h5>
                      <div class="pretty-form__item">
                        <p>
                          <button
                            class={clsx(styles.socialButton, 'button', 'button--light')}
                            type="button"
                          >
                            <Icon name="vk" class={styles.icon} />
                            {t('Connect')}
                          </button>
                        </p>
                      </div>

                      <h5>Facebook</h5>
                      <div class="pretty-form__item">
                        <p>
                          <button
                            class={clsx(styles.socialButton, 'button', 'button--light')}
                            type="button"
                          >
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
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>

        <Show when={isFloatingPanelVisible() && !emailError() && !newPasswordError()}>
          <div class={styles.formActions}>
            <div class="wide-container">
              <div class="row">
                <div class="col-md-19 offset-md-5">
                  <div class="row">
                    <div class="col-md-20 col-lg-18 col-xl-16">
                      <div class={styles.content}>
                        <Button
                          class={styles.cancel}
                          variant="light"
                          value={
                            <>
                              <span class={styles.cancelLabel}>{t('Cancel changes')}</span>
                              <span class={styles.cancelLabelMobile}>{t('Cancel')}</span>
                            </>
                          }
                          onClick={handleCancel}
                        />
                        <Button
                          onClick={handleSubmit}
                          variant="primary"
                          disabled={isSubmitting()}
                          value={isSubmitting() ? t('Saving...') : t('Save settings')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </AuthGuard>
    </PageLayout>
  )
}

export const Page = ProfileSecurityPage
