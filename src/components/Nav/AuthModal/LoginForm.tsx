import type { AuthModalSearchParams } from './types'

import { clsx } from 'clsx'
import { Show, createSignal, createEffect, JSX } from "solid-js";

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { useSnackbar } from '../../../context/snackbar'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'
import { validateEmail } from '../../../utils/validateEmail'

import { AuthModalHeader } from './AuthModalHeader'
import { PasswordField } from './PasswordField'
import { SocialProviders } from "./SocialProviders"
import { email, setEmail } from './sharedLogic'

import styles from './AuthModal.module.scss'

type FormFields = {
  email: string
  password: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string>>

export const LoginForm = () => {
  const { changeSearchParams } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()
  const [submitError, setSubmitError] = createSignal<string | JSX.Element>()
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [password, setPassword] = createSignal('')
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})

  const [isLinkSent, setIsLinkSent] = createSignal(false)
  const authFormRef: { current: HTMLFormElement } = { current: null }
  const { showSnackbar } = useSnackbar()
  const { signIn } = useSession()

  const handleEmailInput = (newEmail: string) => {
    setValidationErrors(({ email: _notNeeded, ...rest }) => rest)
    setEmail(newEmail.toLowerCase())
  }

  const handlePasswordInput = (newPassword: string) => {
    setValidationErrors(({ password: _notNeeded, ...rest }) => rest)
    setPassword(newPassword)
  }

  const handleSendLinkAgainClick = (event: Event) => {
    event.preventDefault()

    setIsLinkSent(true)
    setSubmitError()
    changeSearchParams({ mode: 'send-confirm-email' })
  }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()
    setIsLinkSent(false)
    setSubmitError()

    if (Object.keys(validationErrors()).length > 0) {
      authFormRef.current
        .querySelector<HTMLInputElement>(`input[name="${Object.keys(validationErrors())[0]}"]`)
        ?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      const { errors } = await signIn({ email: email(), password: password() })
      console.error("[signIn errors]", errors)
      if (errors?.length > 0) {
        if (errors.some((error) => error.message.includes('bad user credentials'))) {
          setValidationErrors((prev) => ({
            ...prev,
            password: t('Something went wrong, check email and password'),
          }))
        } else if (errors.some((error) => error.message.includes('user not found'))) {
          setSubmitError('Пользователь не найден');
        } else if (errors.some((error) => error.message.includes('email not verified'))) {
          setSubmitError(
            <div class={styles.info}>
              {t('This email is not verified')}{'. '}
              <span class={"link"} onClick={handleSendLinkAgainClick}>
                {t("Send link again")}
              </span>
            </div>
          )
        } else {
          setSubmitError(t("Error", errors[0].message));
        }
        return;
      }
      hideModal();
      showSnackbar({ body: t("Welcome!") });
    } catch (error) {
      console.error(error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false)
    }
  }
  createEffect(() => {
    console.log("!!! submitError:", submitError());
  })

  const handleBlurInput = async (value: string, type: 'email' | 'password') => {
    if (type === 'email') {
      if (value === '' || !validateEmail(value)) {
        setValidationErrors((prev) => ({
          ...prev,
          email: t('Invalid email'),
        }));
      }
    } else if (type === 'password') {
      if (value === '') {
        setValidationErrors((prev) => ({
          ...prev,
          password: t('Please enter password'),
        }));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} class={styles.authForm} ref={(el) => (authFormRef.current = el)}>
      <div>
        <AuthModalHeader modalType="login" />
        <div
          class={clsx("pretty-form__item", {
            "pretty-form__item--error": validationErrors().email,
          })}
        >
          <input
            id="email"
            name="email"
            autocomplete="email"
            type="email"
            value={email()}
            placeholder={t("Email")}
            onBlur={(event) => handleBlurInput(event.currentTarget.value, "email")}
            onInput={(event) => handleEmailInput(event.currentTarget.value)}
          />
          <label for="email">{t("Email")}</label>
          <Show when={validationErrors().email}>
            <div class={styles.validationError}>{validationErrors().email}</div>
          </Show>
        </div>
        <PasswordField
          variant={"login"}
          onBlur={(value) => handleBlurInput(value, "password")}
          onInput={(value) => handlePasswordInput(value)}
        />
        <Show when={validationErrors().password}>
          <div class={styles.validationError} style={{ position: "static", "font-size": "1.4rem" }}>
            {validationErrors().password}
          </div>
        </Show>
        <Show when={submitError()}>
          <div class={clsx('form-message--error', styles.submitError)}>{submitError()}</div>
        </Show>

        <div>
          <button class={clsx("button", styles.submitButton)} disabled={isSubmitting()} type="submit">
            {isSubmitting() ? "..." : t("Enter")}
          </button>
        </div>
        <div class={styles.authActions}>
          <span
            class="link"
            onClick={() =>
              changeSearchParams({
                mode: "send-reset-link",
              })
            }
          >
            {t("Set the new password")}
          </span>
        </div>
      </div>

      <div>
        <SocialProviders />

        <div class={styles.authControl}>
          <span
            class={styles.authLink}
            onClick={() =>
              changeSearchParams({
                mode: "register",
              })
            }
          >
            {t("I have no account yet")}
          </span>
        </div>
      </div>
    </form>
  );
}
