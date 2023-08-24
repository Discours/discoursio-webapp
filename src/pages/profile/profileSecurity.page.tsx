import { For, createSignal, Show, onMount, onCleanup } from 'solid-js'
import { createStore } from 'solid-js/store'
import { clsx } from 'clsx'
import deepEqual from 'fast-deep-equal'

import { useSession } from '../../context/session'
import { useProfileSecurityForm } from '../../context/profileSecurity'
import { useSnackbar } from '../../context/snackbar'
import { useLocalize } from '../../context/localize'

import { PageLayout } from '../../components/_shared/PageLayout'
import { Icon } from '../../components/_shared/Icon'
import ProfileSettingsNavigation from '../../components/Discours/ProfileSettingsNavigation'
import FloatingPanel from '../../components/_shared/FloatingPanel/FloatingPanel'

import { clone } from '../../utils/clone'

import styles from './Settings.module.scss'

export const ProfileSecurityPage = () => {
  const { t } = useLocalize()

  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const {
    actions: { loadSession }
  } = useSession()

  const { form, updateFormField, submit, slugError } = useProfileSecurityForm()
  const [prevForm, setPrevForm] = createStore(clone(form))

  const [isFloatingPanelVisible, setIsFloatingPanelVisible] = createSignal(false)

  const handleSubmit = async (event: Event) => {
    event.preventDefault()
    try {
      await submit(form)
      setPrevForm(clone(form))
      showSnackbar({ body: t('Profile successfully saved') })
    } catch {
      showSnackbar({ type: 'error', body: t('Error') })
    }

    loadSession()
  }

  const [hostname, setHostname] = createSignal<string | null>(null)

  onMount(() => {
    setHostname(window?.location.host)

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const handleBeforeUnload = (event) => {
      if (!deepEqual(form, prevForm)) {
        event.returnValue = t(
          'There are unsaved changes in your profile settings. Are you sure you want to leave the page without saving?'
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    onCleanup(() => window.removeEventListener('beforeunload', handleBeforeUnload))
  })

  const handleSaveProfile = () => {
    setIsFloatingPanelVisible(false)
    setPrevForm(clone(form))
  }

  const compareNewPasswords = (newPass: string) => {}

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

                <form
                  onSubmit={handleSubmit}
                  onChange={() => {
                    if (!deepEqual(form, prevForm)) {
                      setIsFloatingPanelVisible(true)
                    }
                  }}
                  enctype="multipart/form-data"
                >
                  <h4>Почта</h4>
                  <div class="pretty-form__item">
                    <input
                      type="text"
                      name="email"
                      id="email"
                      placeholder="Почта"
                      onChange={(event) => updateFormField('email', event.currentTarget.value)}
                    />
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
                      onChange={(event) => updateFormField('old_password', event.currentTarget.value)}
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
                      onChange={(event) => updateFormField('new_password', event.currentTarget.value)}
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
                      onChange={(event) => compareNewPasswords(event.currentTarget.value)}
                    />
                    <button type="button" class={styles.passwordToggleControl}>
                      <Icon name="password-open" />
                    </button>
                  </div>

                  {/* <h4>Социальные сети</h4>
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
                  </div> */}

                  <br />
                  <FloatingPanel
                    isVisible={isFloatingPanelVisible()}
                    confirmTitle={t('Save settings')}
                    confirmAction={handleSaveProfile}
                    declineTitle={t('Cancel')}
                    declineAction={() => setIsFloatingPanelVisible(false)}
                  />
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
