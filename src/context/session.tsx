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
  onMount,
  useContext,
} from 'solid-js'

import { inboxClient } from '../graphql/client/chat'
import { apiClient } from '../graphql/client/core'
import { notifierClient } from '../graphql/client/notifier'
import { useRouter } from '../stores/router'
import { showModal } from '../stores/ui'

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
    if (token) {
      changeSearchParams({
        mode: 'change-password',
        modal: 'auth',
      })
    } else if (access_token) {
      changeSearchParams({
        mode: 'confirm-email',
        modal: 'auth',
      })
    }
  })

  // load

  const [configuration, setConfig] = createSignal<ConfigType>(defaultConfig)
  const authorizer = createMemo(() => new Authorizer(defaultConfig))
  const [isSessionLoaded, setIsSessionLoaded] = createSignal(false)
  const [session, { refetch: loadSession, mutate: setSession }] = createResource<AuthToken>(
    async () => {
      try {
        console.info('[context.session] loading session')
        return await authorizer().getSession()
      } catch {
        console.info('[context.session] cannot refresh session')
        return null
      }
    },
    {
      ssrLoadFrom: 'initial',
      initialValue: null,
    },
  )

  const [author, { refetch: loadAuthor, mutate: setAuthor }] = createResource<Author | null>(
    async () => {
      const u = session()?.user
      return u ? (await apiClient.getAuthorId({ user: u.id })) || null : null
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

  // session postload effect
  createEffect(async () => {
    if (session()) {
      const token = session()?.access_token
      if (token) {
        console.log('[context.session] token observer got token', token)
        if (!inboxClient.private) {
          apiClient.connect(token)
          notifierClient.connect(token)
          inboxClient.connect(token)
        }
        if (!author()) {
          const a = await loadAuthor()
          await loadSubscriptions()
          if (a) {
            console.log('[context.session] author profile and subs loaded', author())
          } else {
            console.warn('[context.session] author is not loaded')
          }
          setIsSessionLoaded(true)
        }
      }
    }
  })

  createEffect(() => {
    if (session() !== null && author() === null) {
      setIsSessionLoaded(true)
      setAuthor(null)
      setSubscriptions(EMPTY_SUBSCRIPTIONS)
    }
  })

  // initial effect
  onMount(async () => {
    const metaRes = await authorizer().getMetaData()
    setConfig({ ...defaultConfig, ...metaRes, redirectURL: window.location.origin })
    let s
    try {
      s = await loadSession()
    } catch {
      console.warn('[context.session] load session failed')
    }
    if (!s) {
      setIsSessionLoaded(true)
      setSession(null)
      setAuthor(null)
    }
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

  const signUp = async (params) => {
    const authResult: void | AuthToken = await authorizer().signup({
      ...params,
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
    setSession(null)
    showSnackbar({ body: t("You've successfully logged out") })
  }

  const changePassword = async (password: string, token: string) => {
    const resp = await authorizer().resetPassword({ password, token, confirm_password: password })
    console.debug('[context.session] change password response:', resp)
  }

  const confirmEmail = async (input: VerifyEmailInput) => {
    console.debug(`[context.session] calling authorizer's verify email with`, input)
    const at: void | AuthToken = await authorizer().verifyEmail(input)
    if (at) setSession(at)
    return at
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
