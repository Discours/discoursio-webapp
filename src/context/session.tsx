import {
  ApiResponse,
  AuthToken,
  Authorizer,
  ConfigType,
  ForgotPasswordInput,
  GenericResponse,
  LoginInput,
  ResendVerifyEmailInput,
  SignupInput,
  UpdateProfileInput,
  VerifyEmailInput
} from '@authorizerdev/authorizer-js'
import { useSearchParams } from '@solidjs/router'
import type { Accessor, JSX, Resource } from 'solid-js'
import {
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  on,
  onCleanup,
  onMount,
  useContext
} from 'solid-js'
import { type AuthModalSource, useSnackbar, useUI } from '~/context/ui'
import { authApiUrl } from '../config'
import { useLocalize } from './localize'

const defaultConfig: ConfigType = {
  authorizerURL: authApiUrl.replace('/graphql', ''),
  redirectURL: 'https://testing.discours.io',
  clientID: 'b9038a34-ca59-41ae-a105-c7fbea603e24'
}

export type SessionContextType = {
  config: Accessor<ConfigType>
  session: Resource<AuthToken>
  authError: Accessor<string>
  isSessionLoaded: Accessor<boolean>
  loadSession: () => AuthToken | Promise<AuthToken> | undefined | null
  setSession: (token: AuthToken) => void
  requireAuthentication: (
    callback: (() => Promise<void>) | (() => void),
    modalSource: AuthModalSource
  ) => void
  signUp: (params: SignupInput) => Promise<boolean>
  signIn: (params: LoginInput) => Promise<boolean>
  updateProfile: (params: UpdateProfileInput) => Promise<boolean>
  signOut: () => Promise<boolean>
  oauth: (provider: string) => Promise<void>
  forgotPassword: (params: ForgotPasswordInput) => Promise<string>
  changePassword: (password: string, token: string) => void
  confirmEmail: (input: VerifyEmailInput) => Promise<void>
  setIsSessionLoaded: (loaded: boolean) => void
  authorizer: () => Authorizer
  isRegistered: (email: string) => Promise<string>
  resendVerifyEmail: (params: ResendVerifyEmailInput) => Promise<boolean>
}

const noop = () => null
const metaRes = {
  data: {
    meta: {
      version: 'latest',
      client_id: 'b9038a34-ca59-41ae-a105-c7fbea603e24',
      is_google_login_enabled: true,
      is_facebook_login_enabled: true,
      is_github_login_enabled: true,
      is_linkedin_login_enabled: false,
      is_apple_login_enabled: false,
      is_twitter_login_enabled: true,
      is_microsoft_login_enabled: false,
      is_twitch_login_enabled: false,
      is_roblox_login_enabled: false,
      is_email_verification_enabled: true,
      is_basic_authentication_enabled: true,
      is_magic_link_login_enabled: true,
      is_sign_up_enabled: true,
      is_strong_password_enabled: false,
      is_multi_factor_auth_enabled: true,
      is_mobile_basic_authentication_enabled: true,
      is_phone_verification_enabled: false
    }
  }
}
const SessionContext = createContext<SessionContextType>({} as SessionContextType)

export function useSession() {
  return useContext(SessionContext)
}

export const SessionProvider = (props: {
  onStateChangeCallback(state: AuthToken): unknown
  children: JSX.Element
}) => {
  const { t } = useLocalize()
  const { showSnackbar } = useSnackbar()
  const [searchParams, changeSearchParams] = useSearchParams<{
    mode?: string
    m?: string
    state?: string
    redirectURL?: string
    redirect_uri?: string
    token?: string
    access_token?: string
    scope?: string
  }>()
  const clearSearchParams = () => changeSearchParams({}, { replace: true })
  const [config, setConfig] = createSignal<ConfigType>(defaultConfig)
  const authorizer = createMemo(() => new Authorizer(config()))
  const [oauthState, setOauthState] = createSignal<string>()

  // load
  let minuteLater: NodeJS.Timeout | null
  const [isSessionLoaded, setIsSessionLoaded] = createSignal(false)
  const [authError, setAuthError] = createSignal<string>('')
  const { showModal } = useUI()

  // handle auth state callback from outside
  onMount(() => {
    const params = searchParams
    if (params?.state) {
      setOauthState((_s) => params?.state)
      const scope = params?.scope ? params?.scope?.toString().split(' ') : ['openid', 'profile', 'email']
      if (scope) console.info(`[context.session] scope: ${scope}`)
      const url = params?.redirect_uri || params?.redirectURL || window.location.href
      setConfig((c: ConfigType) => ({ ...c, redirectURL: url.split('?')[0] }))
      changeSearchParams({ mode: 'confirm-email', m: 'auth' }, { replace: true })
    }
  })

  // handle token confirm
  createEffect(() => {
    const token = searchParams?.token
    const access_token = searchParams?.access_token
    if (access_token)
      changeSearchParams({
        mode: 'confirm-email',
        m: 'auth',
        access_token
      })
    else if (token) {
      changeSearchParams({
        mode: 'change-password',
        m: 'auth',
        token
      })
    }
  })

  // Function to load session data
  const sessionData = async () => {
    try {
      const s: ApiResponse<AuthToken> = await authorizer().getSession()
      if (s?.data) {
        console.info('[context.session] loading session', s)
        clearSearchParams()
        // Set session expiration time in local storage
        const expires_at = new Date(Date.now() + s.data.expires_in * 1000)
        localStorage?.setItem('expires_at', `${expires_at.getTime()}`)

        // Set up session expiration check timer
        minuteLater = setTimeout(checkSessionIsExpired, 60 * 1000)
        console.info(`[context.session] will refresh in ${s.data.expires_in / 60} mins`)

        // Set the session loaded flag
        setIsSessionLoaded(true)

        return s.data
      }
      console.info('[context.session] cannot refresh session', s.errors)
      setAuthError(s.errors?.pop()?.message || '')

      // Set the session loaded flag even if there's an error
      setIsSessionLoaded(true)
    } catch (error) {
      console.info('[context.session] cannot refresh session', error)
      if (error) setAuthError(t('error'))

      // Set the session loaded flag even if there's an error
      setIsSessionLoaded(true)
    }
    return {} as AuthToken
  }

  const [session, { refetch: loadSession, mutate: setSession }] = createResource<AuthToken>(sessionData, {
    ssrLoadFrom: 'initial',
    initialValue: {} as AuthToken
  })

  const checkSessionIsExpired = () => {
    const expires_at_data = localStorage?.getItem('expires_at')

    if (expires_at_data) {
      const expires_at = Number.parseFloat(expires_at_data)
      const current_time = Date.now()

      // Check if the session has expired
      if (current_time >= expires_at) {
        console.info('[context.session] Session has expired, refreshing.')
        loadSession()
      } else {
        // Schedule the next check
        minuteLater = setTimeout(checkSessionIsExpired, 60 * 1000)
      }
    }
  }

  onCleanup(() => clearTimeout(minuteLater as NodeJS.Timeout))

  // initial effect
  onMount(() => {
    setConfig({
      ...defaultConfig,
      ...metaRes,
      redirectURL: window.location.origin
    })
    loadSession()
  })

  // callback state updater
  createEffect(
    on([() => props.onStateChangeCallback, session], ([_, ses]) => {
      ses?.user?.id && props.onStateChangeCallback(ses)
    })
  )

  const [authCallback, setAuthCallback] = createSignal<() => void>(noop)
  const requireAuthentication = (callback: () => void, modalSource: AuthModalSource) => {
    setAuthCallback((_cb) => callback)
    if (!session()) {
      loadSession()
      if (!session()) {
        showModal('auth', modalSource)
      }
    }
  }

  createEffect(() => {
    const handler = authCallback()
    if (handler !== noop) {
      handler()
      setAuthCallback((_cb) => noop)
    }
  })

  // authorizer api proxy methods
  const authenticate = async (
    authFunction: (data: SignupInput) => Promise<ApiResponse<AuthToken | GenericResponse>>,
    // biome-ignore lint/suspicious/noExplicitAny: authorizer
    params: any
  ) => {
    const resp = await authFunction(params)
    console.debug('[context.session] authenticate:', resp)
    if (resp?.data && resp?.errors.length === 0) setSession(resp.data as AuthToken)
    return { data: resp?.data, errors: resp?.errors }
  }
  const signUp = async (params: SignupInput): Promise<boolean> => {
    const resp = await authenticate(authorizer().signup, params as SignupInput)
    console.debug('[context.session] signUp:', resp)
    if (resp?.data) {
      setSession(resp.data as AuthToken)
      return true
    }
    return false
  }

  const signIn = async (params: LoginInput): Promise<boolean> => {
    const resp = await authenticate(authorizer().login, params as LoginInput)
    console.debug('[context.session] signIn:', resp)
    if (resp?.data) {
      setSession(resp.data as AuthToken)
      return true
    }
    console.warn('[signIn] response: ', resp)
    setAuthError(resp.errors.pop()?.message || '')
    return false
  }

  const updateProfile = async (params: UpdateProfileInput) => {
    const resp = await authenticate(authorizer().updateProfile, params as UpdateProfileInput)
    console.debug('[context.session] updateProfile response:', resp)
    if (resp?.data) {
      // console.debug('[context.session] response data ', resp.data)
      // FIXME: renew updated profile
      return true
    }
    return false
  }

  const signOut = async () => {
    const authResult: ApiResponse<GenericResponse> = await authorizer().logout()
    // console.debug('[context.session] sign out', authResult)
    if (authResult) {
      setSession({} as AuthToken)
      setIsSessionLoaded(true)
      showSnackbar({ body: t("You've successfully logged out") })
      // console.debug(session())
      return true
    }
    return false
  }

  const changePassword = async (password: string, token: string) => {
    const resp = await authorizer().resetPassword({
      password,
      token,
      confirm_password: password
    })
    console.debug('[context.session] change password response:', resp)
  }

  const forgotPassword = async (params: ForgotPasswordInput) => {
    const resp = await authorizer().forgotPassword(params)
    console.debug('[context.session] change password response:', resp)
    return resp?.errors?.pop()?.message || ''
  }

  const resendVerifyEmail = async (params: ResendVerifyEmailInput): Promise<boolean> => {
    const resp = await authorizer().resendVerifyEmail(params as ResendVerifyEmailInput)
    console.debug('[context.session] resend verify email response:', resp)
    if (resp.errors) {
      resp.errors.forEach((error) => {
        showSnackbar({ type: 'error', body: error.message })
      })
    }
    return resp ? resp.data?.message === 'Verification email has been sent. Please check your inbox' : false
  }

  const isRegistered = async (email: string): Promise<string> => {
    console.debug('[context.session] calling is_registered for ', email)
    try {
      const response = await authorizer().graphqlQuery({
        query: `query { is_registered(email: "${email}") { message }}`
      })
      return response?.data?.is_registered?.message
    } catch (error) {
      console.warn(error)
    }
    return ''
  }

  const confirmEmail = async (input: VerifyEmailInput) => {
    console.debug(`[context.session] calling authorizer's verify email with`, input)
    const at: ApiResponse<AuthToken> = await authorizer().verifyEmail(input)
    if (at?.data) {
      setSession(at.data)
    } else {
      console.warn(at)
    }
  }

  const oauth = async (oauthProvider: string) => {
    console.debug(`[context.session] calling authorizer's oauth for`)
    try {
      await authorizer().oauthLogin(oauthProvider, [], window?.location?.origin || '', oauthState())
    } catch (error) {
      console.warn(error)
    }
  }
  const actions = {
    loadSession,
    requireAuthentication,
    signUp,
    signIn,
    signOut,
    confirmEmail,
    updateProfile,
    setIsSessionLoaded,
    setSession,
    authorizer,
    forgotPassword,
    changePassword,
    oauth,
    isRegistered
  }
  const value: SessionContextType = {
    authError,
    config,
    session,
    isSessionLoaded,
    ...actions,
    resendVerifyEmail
  }

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
