import { Show } from 'solid-js/web'
import { Icon } from './Icon'
import { createEffect, createSignal, onMount } from 'solid-js'
import './AuthModal.scss'
import { Form } from 'solid-js-form'
import { t } from '../../utils/intl'
import { hideModal, useModalStore } from '../../stores/ui'
import { useAuthStore, signIn, register } from '../../stores/auth'
import { useValidator } from '../../utils/validators'
import { baseUrl } from '../../graphql/publicGraphQLClient'
import { ApiError } from '../../utils/apiClient'
import { handleClientRouteLinkClick } from '../../stores/router'

type AuthMode = 'sign-in' | 'sign-up' | 'forget' | 'reset' | 'resend' | 'password'

const statuses: { [key: string]: string } = {
  'email not found': 'No such account, please try to register',
  'invalid password': 'Invalid password',
  'invalid code': 'Invalid code',
  'unknown error': 'Unknown error'
}

const titles = {
  'sign-up': t('Create account'),
  'sign-in': t('Enter the Discours'),
  forget: t('Forgot password?'),
  reset: t('Please, confirm your email to finish'),
  resend: t('Resend code'),
  password: t('Enter your new password')
}

// const isProperEmail = (email) => email && email.length > 5 && email.includes('@') && email.includes('.')

// 3rd party provider auth handler
const oauth = (provider: string): void => {
  const popup = window.open(`${baseUrl}/oauth/${provider}`, provider, 'width=740, height=420')
  popup?.focus()
  hideModal()
}

// FIXME !!!
// eslint-disable-next-line sonarjs/cognitive-complexity
export default (props: { code?: string; mode?: AuthMode }) => {
  const { session } = useAuthStore()
  const [handshaking] = createSignal(false)
  const { getModal } = useModalStore()
  const [authError, setError] = createSignal<string>('')
  const [mode, setMode] = createSignal<AuthMode>('sign-in')
  const [validation, setValidation] = createSignal({})
  const [initial, setInitial] = createSignal({})
  let emailElement: HTMLInputElement | undefined
  let pass2Element: HTMLInputElement | undefined
  let passElement: HTMLInputElement | undefined
  let codeElement: HTMLInputElement | undefined

  // FIXME: restore logic
  // const usedEmails = {}
  // const checkEmailAsync = async (email: string) => {
  //   const handleChecked = (x: boolean) => {
  //     if (x && mode() === 'sign-up') setError(t('We know you, please try to sign in'))
  //     if (!x && mode() === 'sign-in') setError(t('No such account, please try to register'))
  //     usedEmails[email] = x
  //   }
  //   if (email in usedEmails) {
  //     handleChecked(usedEmails[email])
  //   } else if (isProperEmail(email)) {
  //     const { error, data } = await apiClient.q(authCheck, { email }, true)
  //     if (error) setError(error.message)
  //     if (data) handleChecked(data.isEmailUsed)
  //   }
  // }

  // let checkEmailTimeout
  // createEffect(() => {
  //   const email = emailElement?.value
  //   if (isProperEmail(email)) {
  //     if (checkEmailTimeout) clearTimeout(checkEmailTimeout)
  //     checkEmailTimeout = setTimeout(checkEmailAsync, 3000) // after 3 secs
  //   }
  // }, [emailElement?.value])

  // switching initial values and validatiors
  const setupValidators = () => {
    const [vs, ini] = useValidator(mode())
    setValidation(vs)
    setInitial(ini)
  }

  onMount(setupValidators)

  const resetError = () => {
    setError('')
  }

  const changeMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetError()
  }

  // local auth handler
  const localAuth = async () => {
    console.log('[auth] native account processing')
    switch (mode()) {
      case 'sign-in':
        try {
          await signIn({ email: emailElement?.value, password: passElement?.value })
        } catch (error) {
          if (error instanceof ApiError) {
            if (error.code === 'email_not_confirmed') {
              setError(t('Please, confirm email'))
              return
            }

            if (error.code === 'user_not_found') {
              setError(t('Something went wrong, check email and password'))
              return
            }
          }

          setError(error.message)
        }

        break
      case 'sign-up':
        if (pass2Element?.value !== passElement?.value) {
          setError(t('Passwords are not equal'))
        } else {
          await register({
            email: emailElement?.value,
            password: passElement?.value
          })
        }
        break
      case 'reset':
        // send reset-code to login with email
        console.log('[auth] reset code: ' + codeElement?.value)
        // TODO: authReset(codeElement?.value)
        break
      case 'resend':
        // TODO: authResend(emailElement?.value)
        break
      case 'forget':
        // shows forget mode of auth-modal
        if (pass2Element?.value !== passElement?.value) {
          setError(t('Passwords are not equal'))
        } else {
          // TODO: authForget(passElement?.value)
        }
        break
      default:
        console.log('[auth] unknown auth mode', mode())
    }
  }

  // FIXME move to handlers
  createEffect(() => {
    if (session()?.user?.slug && getModal() === 'auth') {
      // hiding itself if finished
      console.log('[auth] success, hiding modal')
      hideModal()
    } else if (session()?.error) {
      console.log('[auth] failure, showing error')
      setError(t(statuses[session().error || 'unknown error']))
    } else {
      console.log('[auth] session', session())
    }
  })

  return (
    <div class="row view" classList={{ 'view--sign-up': mode() === 'sign-up' }}>
      <div class="col-sm-6 d-md-none auth-image">
        <div class="auth-image__text" classList={{ show: mode() === 'sign-up' }}>
          <h2>{t('Discours')}</h2>
          <h4>{t(`Join the global community of authors!`)}</h4>
          <p class="auth-benefits">
            {t(
              'Get to know the most intelligent people of our time, edit and discuss the articles, share your expertise, rate and decide what to publish in the magazine'
            )}
            .&nbsp;
            {t('New stories every day and even more!')}
          </p>
          <p class="disclamer">
            {t('By signing up you agree with our')}{' '}
            <a
              href="/about/terms-of-use"
              onClick={(event) => {
                hideModal()
                handleClientRouteLinkClick(event)
              }}
            >
              {t('terms of use')}
            </a>
            , {t('personal data usage and email notifications')}.
          </p>
        </div>
      </div>
      <div class="col-sm-6 auth">
        <Form
          initialValues={initial()}
          validation={validation()}
          onSubmit={async (form) => {
            console.log('[auth] form values', form.values)
          }}
        >
          <div class="auth__inner">
            <h4>{titles[mode()]}</h4>
            <div class={`auth-subtitle ${mode() === 'forget' ? '' : 'hidden'}`}>
              <Show
                when={mode() === 'forget'}
                fallback={
                  <Show when={mode() === 'reset'}>
                    {t('Enter the code or click the link from email to confirm')}
                  </Show>
                }
              >
                {t('Everything is ok, please give us your email address')}
              </Show>
            </div>
            <Show when={authError()}>
              <div class={`auth-info`}>
                <ul>
                  <li class="warn">{authError()}</li>
                </ul>
              </div>
            </Show>
            {/*FIXME*/}
            {/*<Show when={false && mode() === 'sign-up'}>*/}
            {/*  <div class='pretty-form__item'>*/}
            {/*    <input*/}
            {/*      id='username'*/}
            {/*      name='username'*/}
            {/*      autocomplete='username'*/}
            {/*      ref={usernameElement}*/}
            {/*      type='text'*/}
            {/*      placeholder={t('Username')}*/}
            {/*    />*/}
            {/*    <label for='username'>{t('Username')}</label>*/}
            {/*  </div>*/}
            {/*</Show>*/}
            <Show when={mode() !== 'reset' && mode() !== 'password'}>
              <div class="pretty-form__item">
                <input
                  id="email"
                  name="email"
                  autocomplete="email"
                  ref={emailElement}
                  type="text"
                  placeholder={t('Email')}
                />
                <label for="email">{t('Email')}</label>
              </div>
            </Show>
            <Show when={mode() === 'sign-up' || mode() === 'sign-in' || mode() === 'password'}>
              <div class="pretty-form__item">
                <input
                  id="password"
                  name="password"
                  autocomplete="current-password"
                  ref={passElement}
                  type="password"
                  placeholder={t('Password')}
                />
                <label for="password">{t('Password')}</label>
              </div>
            </Show>
            <Show when={mode() === 'reset'}>
              <div class="pretty-form__item">
                <input
                  id="resetcode"
                  name="resetcode"
                  ref={codeElement}
                  value={props.code}
                  type="text"
                  placeholder={t('Reset code')}
                />
                <label for="resetcode">{t('Reset code')}</label>
              </div>
            </Show>
            <Show when={mode() === 'password' || mode() === 'sign-up'}>
              <div class="pretty-form__item">
                <input
                  id="password2"
                  name="password2"
                  ref={pass2Element}
                  type="password"
                  placeholder={t('Password again')}
                  autocomplete=""
                />
                <label for="password2">{t('Password again')}</label>
              </div>
            </Show>
            <div>
              <button class="button submitbtn" disabled={handshaking()} onClick={localAuth}>
                {handshaking() ? '...' : titles[mode()]}
              </button>
            </div>
            <Show when={mode() === 'sign-in'}>
              <div class="auth-actions">
                <a
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault()
                    changeMode('forget')
                  }}
                >
                  {t('Forgot password?')}
                </a>
              </div>
            </Show>
            <Show when={mode() === 'sign-in' || mode() === 'sign-up'}>
              <div class="social-provider">
                <div class="providers-text">{t('Or continue with social network')}</div>
                <div class="social">
                  <a href={''} class="facebook-auth" onClick={() => oauth('facebook')}>
                    <Icon name="facebook" />
                  </a>
                  <a href={''} class="google-auth" onClick={() => oauth('google')}>
                    <Icon name="google" />
                  </a>
                  <a href={''} class="vk-auth" onClick={() => oauth('vk')}>
                    <Icon name="vk" />
                  </a>
                  <a href={''} class="github-auth" onClick={() => oauth('github')}>
                    <Icon name="github" />
                  </a>
                </div>
              </div>
            </Show>
            <div class="auth-control">
              <div classList={{ show: mode() === 'sign-up' }}>
                <span class="auth-link" onClick={() => changeMode('sign-in')}>
                  {t('I have an account')}
                </span>
              </div>
              <div classList={{ show: mode() === 'sign-in' }}>
                <span class="auth-link" onClick={() => changeMode('sign-up')}>
                  {t('I have no account yet')}
                </span>
              </div>
              <div classList={{ show: mode() === 'forget' }}>
                <span class="auth-link" onClick={() => changeMode('sign-in')}>
                  {t('I know the password')}
                </span>
              </div>
              <div classList={{ show: mode() === 'reset' }}>
                <span class="auth-link" onClick={() => changeMode('resend')}>
                  {t('Resend code')}
                </span>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
