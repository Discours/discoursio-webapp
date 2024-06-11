import type { Accessor, JSX, Resource } from 'solid-js'
import type { AuthModalSearchParams, AuthModalSource } from '../components/Nav/AuthModal/types'
import type { Author } from '../graphql/schema/core.gen'

import {
  ApiResponse,
  AuthToken,
  Authorizer,
  ConfigType,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  GenericResponse,
  LoginInput,
  ResendVerifyEmailInput,
  SignupInput,
  UpdateProfileInput,
  VerifyEmailInput,
} from '@authorizerdev/authorizer-js'
import {
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  on,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'

import { inboxClient } from '../graphql/client/chat'
import { apiClient } from '../graphql/client/core'
import { useRouter } from '../stores/router'
import { showModal } from '../stores/ui'
import { addAuthors, loadAuthor } from '../stores/zine/authors'

import { authApiUrl } from '../utils/config'
import { useLocalize } from './localize'
import { useSnackbar } from './snackbar'

const defaultConfig: ConfigType = {
  authorizerURL: authApiUrl.replace('/graphql', ''),
  redirectURL: 'https://testing2.discours.io',
  clientID: '545c8eb6-6e4e-40ba-9165-88da07e11881',
}

export type SessionContextType = {
  config: Accessor<ConfigType>
  session: Resource<AuthToken>
  author: Accessor<Author>
  authError: Accessor<string>
  isSessionLoaded: Accessor<boolean>
  loadSession: () => AuthToken | Promise<AuthToken>
  setSession: (token: AuthToken | null) => void // setSession
  requireAuthentication: (
    callback: (() => Promise<void>) | (() => void),
    modalSource: AuthModalSource,
  ) => void
  signUp: (params: SignupInput) => Promise<{ data: AuthToken; errors: Error[] }>
  signIn: (params: LoginInput) => Promise<{ data: AuthToken; errors: Error[] }>
  updateProfile: (params: UpdateProfileInput) => Promise<{ data: AuthToken; errors: Error[] }>
  signOut: () => Promise<void>
  oauth: (provider: string) => Promise<void>
  forgotPassword: (
    params: ForgotPasswordInput,
  ) => Promise<{ data: ForgotPasswordResponse; errors: Error[] }>
  changePassword: (password: string, token: string) => void
  confirmEmail: (input: VerifyEmailInput) => Promise<AuthToken> // email confirm callback is in authorizer
  setIsSessionLoaded: (loaded: boolean) => void
  authorizer: () => Authorizer
  isRegistered: (email: string) => Promise<string>
  resendVerifyEmail: (params: ResendVerifyEmailInput) => Promise<GenericResponse>
}

const noop = () => null
const metaRes = {
  data: {
    meta: {
      version: 'latest',
      client_id: '545c8eb6-6e4e-40ba-9165-88da07e11881',
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
      is_phone_verification_enabled: false,
    },
  },
}
const SessionContext = createContext<SessionContextType>()

export function useSession() {
  return useContext(SessionContext)
}

export const SessionProvider = (props: {
  onStateChangeCallback(state: AuthToken): unknown
  children: JSX.Element
}) => {
  const { t } = useLocalize()
  const { showSnackbar } = useSnackbar()
  const { searchParams, changeSearchParams } = useRouter()
  const [config, setConfig] = createSignal<ConfigType>(defaultConfig)
  const authorizer = createMemo(() => new Authorizer(config()))
  const [oauthState, setOauthState] = createSignal<string>()

  // handle auth state callback
  createEffect(
    on(
      searchParams,
      (params) => {
        if (params?.state) {
          setOauthState((_s) => params?.state)
          const scope = params?.scope
            ? params?.scope?.toString().split(' ')
            : ['openid', 'profile', 'email']
          if (scope) console.info(`[context.session] scope: ${scope}`)
          const url = params?.redirect_uri || params?.redirectURL || window.location.href
          setConfig((c: ConfigType) => ({ ...c, redirectURL: url.split('?')[0] }))
          changeSearchParams({ mode: 'confirm-email', m: 'auth' }, true)
        }
      },
      { defer: true },
    ),
  )

  // handle token confirm
  createEffect(() => {
    const token = searchParams()?.token
    const access_token = searchParams()?.access_token
    if (access_token)
      changeSearchParams({
        mode: 'confirm-email',
        m: 'auth',
        access_token,
      })
    else if (token) {
      changeSearchParams({
        mode: 'change-password',
        m: 'auth',
        token,
      })
    }
  })

  // load
  let minuteLater: NodeJS.Timeout | null

  const [isSessionLoaded, setIsSessionLoaded] = createSignal(false)
  const [authError, setAuthError] = createSignal('')
  const { clearSearchParams } = useRouter<AuthModalSearchParams>()

  // Function to load session data
  const sessionData = async () => {
    try {
      const s: ApiResponse<AuthToken> = await authorizer().getSession()
      if (s?.data) {
        console.info('[context.session] loading session', s)
        clearSearchParams()
        // Set session expiration time in local storage
        const expires_at = new Date(Date.now() + s.data.expires_in * 1000)
        localStorage.setItem('expires_at', `${expires_at.getTime()}`)

        // Set up session expiration check timer
        minuteLater = setTimeout(checkSessionIsExpired, 60 * 1000)
        console.info(`[context.session] will refresh in ${s.data.expires_in / 60} mins`)

        // Set the session loaded flag
        setIsSessionLoaded(true)

        return s.data
      }
      console.info('[context.session] cannot refresh session', s.errors)
      setAuthError(s.errors.pop().message)

      // Set the session loaded flag even if there's an error
      setIsSessionLoaded(true)

      return null
    } catch (error) {
      console.info('[context.session] cannot refresh session', error)
      setAuthError(error)

      // Set the session loaded flag even if there's an error
      setIsSessionLoaded(true)

      return null
    }
  }

  const [session, { refetch: loadSession, mutate: setSession }] = createResource<AuthToken>(sessionData, {
    ssrLoadFrom: 'initial',
    initialValue: null,
  })

  const checkSessionIsExpired = () => {
    const expires_at_data = localStorage.getItem('expires_at')

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

  onCleanup(() => clearTimeout(minuteLater))

  const [author, setAuthor] = createSignal<Author>()
  // when session is loaded
  createEffect(
    on(
      () => session(),
      async (s: AuthToken) => {
        if (s) {
          const token = s?.access_token
          const profile = s?.user?.app_data?.profile
          if (token && !inboxClient.private) {
            apiClient.connect(token)
            inboxClient.connect(token)
          }
          if (profile?.id) {
            addAuthors([profile])
            setAuthor(profile)
            setIsSessionLoaded(true)
          } else {
            console.warn('app_data is empty')
            if (s?.user) {
              try {
                console.info('Loading author:', s?.user?.nickname)
                const a = await loadAuthor({ slug: s?.user?.nickname })
                addAuthors([a])
                setAuthor(a)
                s.user.app_data.profile = a
              } catch (error) {
                console.error('Error loading author:', error)
              }
            } else {
              console.warn(s)
              setSession(null)
              setAuthor(null)
              setIsSessionLoaded(true)
            }
          }
        }
      },
      { defer: true },
    ),
  )

  // initial effect
  onMount(() => {
    setConfig({
      ...defaultConfig,
      ...metaRes,
      redirectURL: window.location.origin,
    })
    loadSession()
  })

  // callback state updater
  createEffect(
    on([() => props.onStateChangeCallback, session], ([_, ses]) => {
      ses?.user?.id && props.onStateChangeCallback(ses)
    }),
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
  const authenticate = async (authFunction, params) => {
    const resp = await authFunction(params)
    console.debug('[context.session] authenticate:', resp)
    if (resp?.data && resp?.errors.length === 0) {
      setSession(resp.data)
    }
    return { data: resp?.data, errors: resp?.errors }
  }
  const signUp = async (params: SignupInput) => await authenticate(authorizer().signup, params)
  const signIn = async (params: LoginInput) => await authenticate(authorizer().login, params)
  const updateProfile = async (params: UpdateProfileInput) =>
    await authenticate(authorizer().updateProfile, params)

  const signOut = async () => {
    const authResult: ApiResponse<GenericResponse> = await authorizer().logout()
    console.debug(authResult)
    setSession(null)
    setIsSessionLoaded(true)
    showSnackbar({ body: t("You've successfully logged out") })
    console.debug(session())
  }

  const changePassword = async (password: string, token: string) => {
    const resp = await authorizer().resetPassword({
      password,
      token,
      confirm_password: password,
    })
    console.debug('[context.session] change password response:', resp)
  }

  const forgotPassword = async (params: ForgotPasswordInput) => {
    const resp = await authorizer().forgotPassword(params)
    console.debug('[context.session] change password response:', resp)
    return { data: resp?.data, errors: resp.errors }
  }

  const resendVerifyEmail = async (params: ResendVerifyEmailInput) => {
    const resp = await authorizer().resendVerifyEmail(params)
    console.debug('[context.session] resend verify email response:', resp)
    if (resp.errors) {
      resp.errors.forEach((error) => {
        showSnackbar({ type: 'error', body: error.message })
      })
    }
    return resp?.data
  }

  const isRegistered = async (email: string): Promise<string> => {
    console.debug('[context.session] calling is_registered for ', email)
    try {
      const response = await authorizer().graphqlQuery({
        query: `query { is_registered(email: "${email}") { message }}`,
      })
      return response?.data?.is_registered?.message
    } catch (error) {
      console.warn(error)
    }
    return ''
  }

  const confirmEmail = async (input: VerifyEmailInput) => {
    console.debug(`[context.session] calling authorizer's verify email with`, input)
    try {
      const at: ApiResponse<AuthToken> = await authorizer().verifyEmail(input)
      if (at?.data) {
        setSession(at.data)
        return at.data
      }
      console.warn(at?.errors)
    } catch (error) {
      console.warn(error)
    }
  }

  const oauth = async (oauthProvider: string) => {
    console.debug(`[context.session] calling authorizer's oauth for`)
    try {
      await authorizer().oauthLogin(oauthProvider, [], window.location.origin, oauthState())
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
    isRegistered,
  }
  const value: SessionContextType = {
    authError,
    config,
    session,
    isSessionLoaded,
    author,
    ...actions,
    resendVerifyEmail,
  }

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
