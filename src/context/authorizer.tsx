import { createContext, createEffect, createMemo, onCleanup, onMount, useContext } from 'solid-js'
import type { ParentComponent } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Authorizer, User, AuthToken } from '@authorizerdev/authorizer-js'

export enum AuthorizerProviderActionType {
  SET_USER = 'SET_USER',
  SET_TOKEN = 'SET_TOKEN',
  SET_LOADING = 'SET_LOADING',
  SET_AUTH_DATA = 'SET_AUTH_DATA',
  SET_CONFIG = 'SET_CONFIG',
}

export type AuthorizerState = {
  user: User | null
  token: AuthToken | null
  loading: boolean
  config: {
    authorizerURL: string
    redirectURL: string
    client_id: string
    is_google_login_enabled: boolean
    is_github_login_enabled: boolean
    is_facebook_login_enabled: boolean
    is_linkedin_login_enabled: boolean
    is_apple_login_enabled: boolean
    is_twitter_login_enabled: boolean
    is_microsoft_login_enabled: boolean
    is_email_verification_enabled: boolean
    is_basic_authentication_enabled: boolean
    is_magic_link_login_enabled: boolean
    is_sign_up_enabled: boolean
    is_strong_password_enabled: boolean
  }
}

export type AuthorizerProviderAction = {
  type: AuthorizerProviderActionType
  payload: any
}

export type OtpDataType = {
  isScreenVisible: boolean
  email: string
}

type AuthorizerContextActions = {
  setLoading: (loading: boolean) => void
  setToken: (token: AuthToken | null) => void
  setUser: (user: User | null) => void
  setAuthData: (data: AuthorizerState) => void
  authorizer: () => Authorizer
  logout: () => Promise<void>
}

// TODO: fix types
const AuthorizerContext = createContext<[AuthorizerState, AuthorizerContextActions]>([
  {
    config: {
      authorizerURL: '',
      redirectURL: '/',
      client_id: '',
      is_google_login_enabled: true,
      is_github_login_enabled: true,
      is_facebook_login_enabled: true,
      is_linkedin_login_enabled: false,
      is_apple_login_enabled: false,
      is_twitter_login_enabled: true,
      is_microsoft_login_enabled: false,
      is_email_verification_enabled: true,
      is_basic_authentication_enabled: true,
      is_magic_link_login_enabled: true,
      is_sign_up_enabled: true,
      is_strong_password_enabled: true,
    },
    user: null,
    token: null,
    loading: false,
  },
  {
    setLoading: () => {},
    setToken: () => {},
    setUser: () => {},
    setAuthData: () => {},
    authorizer: () =>
      new Authorizer({
        authorizerURL: 'http://auth.discours.io',
        redirectURL: 'http://auth.discours.io',
        clientID: '', // FIXME: add real client id
      }),
    logout: async () => {},
  },
])

type AuthorizerProviderProps = {
  authorizerURL: string
  redirectURL: string
  clientID: string
  onStateChangeCallback?: (stateData: AuthorizerState) => void
}

export const AuthorizerProvider: ParentComponent<AuthorizerProviderProps> = (props) => {
  const [state, setState] = createStore<AuthorizerState>({
    user: null,
    token: null,
    loading: true,
    config: {
      authorizerURL: props.authorizerURL,
      is_apple_login_enabled: false,
      is_microsoft_login_enabled: false,
      redirectURL: props.redirectURL,
      is_google_login_enabled: true,
      is_github_login_enabled: true,
      is_facebook_login_enabled: true,
      is_linkedin_login_enabled: false,
      is_twitter_login_enabled: true,
      is_email_verification_enabled: true,
      is_basic_authentication_enabled: true,
      is_magic_link_login_enabled: true,
      is_sign_up_enabled: false,
      is_strong_password_enabled: true,
      client_id: props.clientID,
    },
  })

  const authorizer = createMemo(
    () =>
      new Authorizer({
        authorizerURL: props.authorizerURL,
        redirectURL: props.redirectURL,
        clientID: props.clientID,
      }),
  )

  createEffect(() => {
    if (props.onStateChangeCallback) {
      props.onStateChangeCallback(state)
    }
  })

  // Actions
  const setLoading = (loading: boolean) => {
    setState('loading', loading)
  }

  const handleTokenChange = (token: AuthToken | null) => {
    setState('token', token)

    // If we have an access_token, then we clear the interval and create a new interval
    // to the token expires_in, so we can retrieve the token again before it expires
    if (token?.access_token) {
      if (interval) {
        clearInterval(interval)
      }

      interval = setInterval(() => {
        getToken()
      }, token.expires_in * 1000) as any
    }
  }

  const setUser = (user: User | null) => {
    setState('user', user)
  }

  const setAuthData = (data: AuthorizerState) => {
    setState(data)
  }

  const logout = async () => {
    setState('loading', true)
    setState('user', null)
  }

  let interval: number | null = null

  const getToken = async () => {
    setState('loading', true)
    const metaRes = await authorizer().getMetaData()

    try {
      const res = await authorizer().getSession()
      if (res.access_token && res.user) {
        setState((prev) => ({
          ...prev,
          token: {
            access_token: res.access_token,
            expires_in: res.expires_in,
            id_token: res.id_token,
            refresh_token: res.refresh_token || '',
          },
          user: res.user,
        }))

        if (interval) {
          clearInterval(interval)
        }

        interval = setInterval(() => {
          getToken()
        }, res.expires_in * 1000) as any
      } else {
        setState((prev) => ({ ...prev, user: null, token: null }))
      }
    } catch (e) {
      setState((prev) => ({ ...prev, user: null, token: null }))
    } finally {
      setState('config', (config) => ({ ...config, ...metaRes }))
      setState('loading', false)
    }
  }

  onMount(() => {
    !state.token && getToken()
  })

  onCleanup(() => {
    if (interval) {
      clearInterval(interval)
    }
  })

  return (
    <AuthorizerContext.Provider
      value={[
        state,
        {
          setUser,
          setLoading,
          setToken: handleTokenChange,
          setAuthData,
          authorizer,
          logout,
        },
      ]}
    >
      {props.children}
    </AuthorizerContext.Provider>
  )
}

export const useAuthorizer = () => useContext(AuthorizerContext)
