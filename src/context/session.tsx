import type { Accessor, JSX, Resource } from 'solid-js'
import type { AuthModalSource } from '../components/Nav/AuthModal/types'
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
import { notifierClient } from '../graphql/client/notifier'
import { useRouter } from '../stores/router'
import { showModal } from '../stores/ui'
import { addAuthors } from '../stores/zine/authors'

import { useLocalize } from './localize'
import { useSnackbar } from './snackbar'

const defaultConfig: ConfigType = {
  authorizerURL: 'https://auth.discours.io',
  redirectURL: 'https://testing.discours.io',
  clientID: 'b9038a34-ca59-41ae-a105-c7fbea603e24', // FIXME: use env?
}

export type SessionContextType = {
  config: Accessor<ConfigType>
  session: Resource<AuthToken>
  author: Resource<Author | null>
  authError: Accessor<string>
  isSessionLoaded: Accessor<boolean>
  isAuthenticated: Accessor<boolean>
  loadSession: () => AuthToken | Promise<AuthToken>
  setSession: (token: AuthToken | null) => void // setSession
  loadAuthor: (info?: unknown) => Author | Promise<Author>
  setAuthor: (a: Author) => void
  requireAuthentication: (
    callback: (() => Promise<void>) | (() => void),
    modalSource: AuthModalSource,
  ) => void
  signUp: (params: SignupInput) => Promise<{ data: AuthToken; errors: Error[] }>
  signIn: (params: LoginInput) => Promise<{ data: AuthToken; errors: Error[] }>
  signOut: () => Promise<void>
  oauth: (provider: string) => Promise<void>
  forgotPassword: (
    params: ForgotPasswordInput,
  ) => Promise<{ data: ForgotPasswordResponse; errors: Error[] }>
  changePassword: (password: string, token: string) => void
  confirmEmail: (input: VerifyEmailInput) => Promise<AuthToken> // email confirm callback is in auth.discours.io
  setIsSessionLoaded: (loaded: boolean) => void
  authorizer: () => Authorizer
  isRegistered: (email: string) => Promise<string>
  resendVerifyEmail: (params: ResendVerifyEmailInput) => Promise<GenericResponse>
}

const noop = () => {}

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

  // handle callback's redirect_uri
  createEffect(() => {
    // oauth
    const state = searchParams()?.state
    if (state) {
      setOauthState((_s) => state)
      const scope = searchParams()?.scope
        ? searchParams()?.scope?.toString().split(' ')
        : ['openid', 'profile', 'email']
      if (scope) console.info(`[context.session] scope: ${scope}`)
      const url = searchParams()?.redirect_uri || searchParams()?.redirectURL || window.location.href
      setConfig((c: ConfigType) => ({ ...c, redirectURL: url.split('?')[0] }))
      changeSearchParams({ mode: 'confirm-email', modal: 'auth' }, true)
    }
  })

  // handle email confirm
  createEffect(() => {
    const token = searchParams()?.token
    const access_token = searchParams()?.access_token
    if (access_token)
      changeSearchParams({
        mode: 'confirm-email',
        modal: 'auth',
        access_token,
      })
    else if (token) changeSearchParams({ mode: 'change-password', modal: 'auth', token })
  })

  // load
  let minuteLater: NodeJS.Timeout | null

  const [isSessionLoaded, setIsSessionLoaded] = createSignal(false)
  const [authError, setAuthError] = createSignal('')

  // Function to load session data
  const sessionData = async () => {
    try {
      const s: ApiResponse<AuthToken> = await authorizer().getSession()
      if (s?.data) {
        console.info('[context.session] loading session', s)

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
  const authorData = async () => {
    const u = session()?.user
    return u ? (await apiClient.getAuthorId({ user: u.id.trim() })) || null : null
  }
  const [author, { refetch: loadAuthor, mutate: setAuthor }] = createResource<Author | null>(authorData, {
    ssrLoadFrom: 'initial',
    initialValue: null,
  })

  // when session is loaded
  createEffect(() => {
    if (session()) {
      const token = session()?.access_token
      if (token) {
        // console.log('[context.session] token observer got token', token)
        if (!inboxClient.private) {
          apiClient.connect(token)
          notifierClient.connect(token)
          inboxClient.connect(token)
        }
        if (!author()) loadAuthor()

        setIsSessionLoaded(true)
      }
    }
  })

  // when author is loaded
  createEffect(() => {
    if (author()) {
      addAuthors([author()])
    } else {
      reset()
    }
  })

  const reset = () => {
    setIsSessionLoaded(true)
    setSession(null)
    setAuthor(null)
  }

  // initial effect
  onMount(async () => {
    const metaRes = await authorizer().getMetaData()
    setConfig({
      ...defaultConfig,
      ...metaRes,
      redirectURL: window.location.origin,
    })
    let s: AuthToken
    try {
      s = await loadSession()
    } catch (error) {
      console.warn('[context.session] load session failed', error)
    }
    if (!s) reset()
  })

  // callback state updater
  createEffect(
    on(
      () => props.onStateChangeCallback,
      () => {
        props.onStateChangeCallback(session())
      },
      { defer: true },
    ),
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

  const signOut = async () => {
    const authResult: ApiResponse<GenericResponse> = await authorizer().logout()
    console.debug(authResult)
    reset()
    showSnackbar({ body: t("You've successfully logged out") })
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
      // console.log(response)
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

  const isAuthenticated = createMemo(() => Boolean(author()))
  const actions = {
    loadSession,
    requireAuthentication,
    signUp,
    signIn,
    signOut,
    confirmEmail,
    setIsSessionLoaded,
    setSession,
    setAuthor,
    authorizer,
    loadAuthor,
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
    isAuthenticated,
    resendVerifyEmail,
  }

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
