import type { AuthModalSource } from '../components/Nav/AuthModal/types'
import type { Author, Result } from '../graphql/schema/core.gen'
import type { Accessor, JSX, Resource } from 'solid-js'

import {
  VerifyEmailInput,
  LoginInput,
  AuthToken,
  Authorizer,
  ConfigType,
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

const config: ConfigType = {
  authorizerURL: 'https://auth.discours.io',
  redirectURL: 'https://discoursio-webapp.vercel.app/?modal=auth',
  clientID: '9c113377-5eea-4c89-98e1-69302462fc08', // FIXME: use env?
}

export type SessionContextType = {
  config: ConfigType
  session: Resource<AuthToken>
  author: Resource<Author | null>
  isSessionLoaded: Accessor<boolean>
  subscriptions: Accessor<Result>
  isAuthenticated: Accessor<boolean>
  isAuthWithCallback: Accessor<() => void>
  actions: {
    getToken: () => string
    loadSession: () => AuthToken | Promise<AuthToken>
    setSession: (token: AuthToken | null) => void // setSession
    loadAuthor: (info?: unknown) => Author | Promise<Author>
    loadSubscriptions: () => Promise<void>
    requireAuthentication: (
      callback: (() => Promise<void>) | (() => void),
      modalSource: AuthModalSource,
    ) => void
    signIn: (params: LoginInput) => Promise<void>
    signOut: () => Promise<void>
    confirmEmail: (input: VerifyEmailInput) => Promise<void> // email confirm callback is in auth.discours.io
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
  const { searchParams, changeSearchParam } = useRouter()
  const [isSessionLoaded, setIsSessionLoaded] = createSignal(false)
  const [subscriptions, setSubscriptions] = createSignal<Result>(EMPTY_SUBSCRIPTIONS)

  const getSession = async (): Promise<AuthToken> => {
    try {
      const tkn = getToken()
      // console.debug('[context.session] token before:', tkn)
      const authResult = await authorizer().getSession({
        Authorization: tkn,
      })
      if (authResult?.access_token) {
        mutate(authResult)
        // console.debug('[context.session] token after:', authResult.access_token)
        await loadSubscriptions()
        return authResult
      }
    } catch (error) {
      console.error('[context.session] getSession error:', error)
      mutate(null)
      return null
    } finally {
      setTimeout(() => {
        setIsSessionLoaded(true)
      }, 0)
    }
  }

  const [session, { refetch: loadSession, mutate }] = createResource<AuthToken>(getSession, {
    ssrLoadFrom: 'initial',
    initialValue: null,
  })

  createEffect(() => {
    // detect confirm redirect
    const params = searchParams()
    if (params?.access_token) {
      console.debug('[context.session] access token presented, changing search params')
      changeSearchParam({ modal: 'auth', mode: 'confirm-email', access_token: params?.access_token })
    }
  })

  createEffect(() => {
    const token = getToken()
    if (!inboxClient.private && token) {
      apiClient.connect(token)
      notifierClient.connect(token)
      inboxClient.connect(token)
    }
  })

  const loadSubscriptions = async (): Promise<void> => {
    if (apiClient.private) {
      const result = await apiClient.getMySubscriptions()
      if (result) {
        setSubscriptions(result)
      } else {
        setSubscriptions(EMPTY_SUBSCRIPTIONS)
      }
    }
  }

  const [author, { refetch: loadAuthor }] = createResource<Author | null>(
    async () => {
      const u = session()?.user
      if (u) {
        return (await apiClient.getAuthorId({ user: u.id })) ?? null
      }
      return null
    },
    {
      ssrLoadFrom: 'initial',
      initialValue: null,
    },
  )

  const isAuthenticated = createMemo(() => Boolean(session()?.user))

  const signIn = async (params: LoginInput) => {
    const authResult: AuthToken | void = await authorizer().login(params)

    if (authResult && authResult.access_token) {
      mutate(authResult)
      await loadSubscriptions()
      console.debug('[context.session] signed in')
    } else {
      console.info((authResult as AuthToken).message)
    }
  }

  const authorizer = createMemo(
    () =>
      new Authorizer({
        authorizerURL: config.authorizerURL,
        redirectURL: config.redirectURL,
        clientID: config.clientID,
      }),
  )

  createEffect(
    on(
      () => props.onStateChangeCallback,
      () => {
        props.onStateChangeCallback(session())
      },
      { defer: true },
    ),
  )

  const [configuration, setConfig] = createSignal<ConfigType>(config)

  onMount(async () => {
    setIsSessionLoaded(false)
    console.log('[context.session] loading...')
    const metaRes = await authorizer().getMetaData()
    setConfig({ ...config, ...metaRes, redirectURL: window.location.origin + '/?modal=auth' })
    console.log('[context.session] refreshing session...')
    const s = await getSession()
    console.debug('[context.session] session:', s)
    console.log('[context.session] loading author...')
    const a = await loadAuthor()
    console.debug('[context.session] author:', a)
    setIsSessionLoaded(true)
    console.log('[context.session] loaded')
  })

  const [isAuthWithCallback, setIsAuthWithCallback] = createSignal<() => void>()
  const requireAuthentication = async (callback: () => void, modalSource: AuthModalSource) => {
    setIsAuthWithCallback(() => callback)

    const userdata = await authorizer().getProfile()
    if (userdata) mutate({ ...session(), user: userdata })

    if (!isAuthenticated()) {
      showModal('auth', modalSource)
    }
  }

  const signOut = async () => {
    await authorizer().logout()
    mutate(null)
    setSubscriptions(EMPTY_SUBSCRIPTIONS)
    showSnackbar({ body: t("You've successfully logged out") })
  }

  const confirmEmail = async (input: VerifyEmailInput) => {
    console.debug(`[context.session] calling authorizer's verify email with`, input)
    const at: void | AuthToken = await authorizer().verifyEmail(input)
    if (at) mutate(at)
    console.log(`[context.session] confirmEmail got result ${at}`)
  }

  const getToken = createMemo(() => session()?.access_token)

  const actions = {
    getToken,
    loadSession,
    loadSubscriptions,
    requireAuthentication,
    signIn,
    signOut,
    confirmEmail,
    setIsSessionLoaded,
    setSession: mutate,
    authorizer,
    loadAuthor,
  }
  const value: SessionContextType = {
    config: configuration(),
    session,
    subscriptions,
    isSessionLoaded,
    isAuthenticated,
    author,
    actions,
    isAuthWithCallback,
  }

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
