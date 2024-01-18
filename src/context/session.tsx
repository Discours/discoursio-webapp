import type { AuthModalSource } from '../components/Nav/AuthModal/types'
import type { Author, Result } from '../graphql/schema/core.gen'
import type { Accessor, JSX, Resource } from 'solid-js'

import {
  VerifyEmailInput,
  LoginInput,
  AuthToken,
  Authorizer,
  ConfigType,
  SignupInput,
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
  redirectURL: 'https://discoursio-webapp.vercel.app',
  clientID: '9c113377-5eea-4c89-98e1-69302462fc08', // FIXME: use env?
}

export type SessionContextType = {
  config: ConfigType
  session: Resource<AuthToken>
  author: Resource<Author | null>
  authError: Accessor<string>
  isSessionLoaded: Accessor<boolean>
  subscriptions: Accessor<Result>
  isAuthWithCallback: Accessor<() => void>
  isAuthenticated: Accessor<boolean>
  actions: {
    loadSession: () => AuthToken | Promise<AuthToken>
    setSession: (token: AuthToken | null) => void // setSession
    loadAuthor: (info?: unknown) => Author | Promise<Author>
    setAuthor: (a: Author) => void
    loadSubscriptions: () => Promise<void>
    requireAuthentication: (
      callback: (() => Promise<void>) | (() => void),
      modalSource: AuthModalSource,
    ) => void
    signUp: (params: SignupInput) => Promise<AuthToken | void>
    signIn: (params: LoginInput) => Promise<void>
    signOut: () => Promise<void>
    changePassword: (password: string, token: string) => void
    confirmEmail: (input: VerifyEmailInput) => Promise<AuthToken | void> // email confirm callback is in auth.discours.io
    setIsSessionLoaded: (loaded: boolean) => void
    authorizer: () => Authorizer
  }
}

const SessionContext = createContext<SessionContextType>()

export function useSession() {
  return useContext(SessionContext)
}

const EMPTY_SUBSCRIPTIONS = {
  topics: [],
  authors: [],
}

export const SessionProvider = (props: {
  onStateChangeCallback(state: any): unknown
  children: JSX.Element
}) => {
  const { t } = useLocalize()
  const {
    actions: { showSnackbar },
  } = useSnackbar()
  const { searchParams, changeSearchParams } = useRouter()

  // handle callback's redirect_uri
  createEffect(async () => {
    // TODO: handle oauth here too
    const token = searchParams()?.token
    const access_token = searchParams()?.access_token
    if (access_token) changeSearchParams({ mode: 'confirm-email', modal: 'auth', access_token })
    else if (token) changeSearchParams({ mode: 'change-password', modal: 'auth', token })
  })

  // load
  let minuteLater

  const [configuration, setConfig] = createSignal<ConfigType>(defaultConfig)
  const authorizer = createMemo(() => new Authorizer(defaultConfig))
  const [isSessionLoaded, setIsSessionLoaded] = createSignal(false)
  const [authError, setAuthError] = createSignal('')
  const [session, { refetch: loadSession, mutate: setSession }] = createResource<AuthToken>(
    async () => {
      try {
        const s = await authorizer().getSession()
        console.info('[context.session] loading session', s)

        // Set session expiration time in local storage
        const expires_at = new Date(Date.now() + s.expires_in * 1000)
        localStorage.setItem('expires_at', `${expires_at.getTime()}`)

        // Set up session expiration check timer
        minuteLater = setTimeout(checkSessionIsExpired, 60 * 1000)
        console.info(`[context.session] will refresh in ${s.expires_in / 60} mins`)

        // Set the session loaded flag
        setIsSessionLoaded(true)

        return s
      } catch (error) {
        console.info('[context.session] cannot refresh session', error)
        setAuthError(error)

        // Set the session loaded flag even if there's an error
        setIsSessionLoaded(true)

        return null
      }
    },
    {
      ssrLoadFrom: 'initial',
      initialValue: null,
    },
  )

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

  const [author, { refetch: loadAuthor, mutate: setAuthor }] = createResource<Author | null>(
    async () => {
      const u = session()?.user
      return u ? (await apiClient.getAuthorId({ user: u.id.trim() })) || null : null
    },
    {
      ssrLoadFrom: 'initial',
      initialValue: null,
    },
  )

  const [subscriptions, setSubscriptions] = createSignal<Result>(EMPTY_SUBSCRIPTIONS)
  const loadSubscriptions = async (): Promise<void> => {
    const result = await apiClient.getMySubscriptions()
    setSubscriptions(result || EMPTY_SUBSCRIPTIONS)
  }

  // when session is loaded
  createEffect(async () => {
    if (session()) {
      const token = session()?.access_token
      if (token) {
        // console.log('[context.session] token observer got token', token)
        if (!inboxClient.private) {
          apiClient.connect(token)
          notifierClient.connect(token)
          inboxClient.connect(token)
        }
        if (!author()) {
          const a = await loadAuthor()
          if (a) {
            await loadSubscriptions()
            addAuthors([a])
          } else {
            reset()
          }
        }
        setIsSessionLoaded(true)
      }
    }
  })

  const reset = () => {
    setIsSessionLoaded(true)
    setSubscriptions(EMPTY_SUBSCRIPTIONS)
    setSession(null)
    setAuthor(null)
  }

  // initial effect
  onMount(async () => {
    const metaRes = await authorizer().getMetaData()
    setConfig({ ...defaultConfig, ...metaRes, redirectURL: window.location.origin })
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

  // require auth wrapper
  const [isAuthWithCallback, setIsAuthWithCallback] = createSignal<() => void>()
  const requireAuthentication = async (callback: () => void, modalSource: AuthModalSource) => {
    setIsAuthWithCallback(() => callback)

    await loadSession()

    if (!session()) {
      showModal('auth', modalSource)
    }
  }

  // authorizer api proxy methods

  const signUp = async (params: Partial<SignupInput>) => {
    const authResult: void | AuthToken = await authorizer().signup({
      ...params,
      password: params.password,
      confirm_password: params.password,
    })
    if (authResult) setSession(authResult)
  }

  const signIn = async (params: LoginInput) => {
    const authResult: AuthToken | void = await authorizer().login(params)
    if (authResult) setSession(authResult)
  }

  const signOut = async () => {
    await authorizer().logout()
    reset()
    showSnackbar({ body: t("You've successfully logged out") })
  }

  const changePassword = async (password: string, token: string) => {
    const resp = await authorizer().resetPassword({ password, token, confirm_password: password })
    console.debug('[context.session] change password response:', resp)
  }

  const confirmEmail = async (input: VerifyEmailInput) => {
    console.debug(`[context.session] calling authorizer's verify email with`, input)
    try {
      const at: void | AuthToken = await authorizer().verifyEmail(input)
      if (at) setSession(at)
      return at
    } catch (error) {
      console.warn(error)
    }
  }

  const isAuthenticated = createMemo(() => Boolean(author()))
  const actions = {
    loadSession,
    loadSubscriptions,
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
    changePassword,
  }
  const value: SessionContextType = {
    authError,
    config: configuration(),
    session,
    subscriptions,
    isSessionLoaded,
    author,
    actions,
    isAuthWithCallback,
    isAuthenticated,
  }

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
