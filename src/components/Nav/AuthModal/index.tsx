import type { AuthModalMode, AuthModalSearchParams } from './types'

import { clsx } from 'clsx'
import { Component, Show, createEffect, createMemo } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { useLocalize } from '../../../context/localize'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'
import { isMobile } from '../../../utils/media-query'

import { ChangePasswordForm } from './ChangePasswordForm'
import { EmailConfirm } from './EmailConfirm'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { SendResetLinkForm } from './SendResetLinkForm'

import styles from './AuthModal.module.scss'
import { SendEmailConfirm } from './SendEmailConfirm'

const AUTH_MODAL_MODES: Record<AuthModalMode, Component> = {
  login: LoginForm,
  register: RegisterForm,
  'send-reset-link': SendResetLinkForm,
  'confirm-email': EmailConfirm,
  'send-confirm-email': SendEmailConfirm,
  'change-password': ChangePasswordForm,
}

export const AuthModal = () => {
  const rootRef: { current: HTMLDivElement } = { current: null }
  const { t } = useLocalize()
  const { searchParams } = useRouter<AuthModalSearchParams>()
  const { source } = searchParams()

  const mode = createMemo<AuthModalMode>(() => {
    return AUTH_MODAL_MODES[searchParams().mode] ? searchParams().mode : 'login'
  })

  createEffect((oldMode) => {
    if (oldMode !== mode() && !isMobile()) {
      rootRef.current?.querySelector('input')?.focus()
    }
  }, null)

  return (
    <div
      ref={(el) => (rootRef.current = el)}
      class={clsx(styles.view, {
        row: !source,
        [styles.signUp]: mode() === 'register' || mode() === 'confirm-email',
      })}
    >
      <Show when={!source}>
        <div class={clsx('col-md-12 d-none d-md-flex', styles.authImage)}>
          <div
            class={styles.authImageText}
            classList={{ [styles.hidden]: mode() !== 'register' && mode() !== 'confirm-email' }}
          >
            <div>
              <h4>{t('Join the global community of authors!')}</h4>
              <p class={styles.authBenefits}>
                {t(
                  'Get to know the most intelligent people of our time, edit and discuss the articles, share your expertise, rate and decide what to publish in the magazine',
                )}
                .&nbsp;
                {t('New stories every day and even more!')}
              </p>
            </div>
            <p class={styles.disclaimer}>
              {t('By signing up you agree with our')}{' '}
              <a
                href="/about/terms-of-use"
                onClick={() => {
                  hideModal()
                }}
              >
                {t('terms of use')}
              </a>
              , {t('personal data usage and email notifications')}.
            </p>
          </div>
        </div>{' '}
      </Show>
      <div
        class={clsx(styles.auth, {
          'col-md-12': !source,
        })}
      >
        <Dynamic component={AUTH_MODAL_MODES[mode()]} />
      </div>
    </div>
  )
}
