import type { ParentComponent } from 'solid-js'

import { Authorizer, User, AuthToken, ConfigType } from '@authorizerdev/authorizer-js'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import { createStore } from 'solid-js/store'

export type AuthorizerState = {
  user: User | null
  token: AuthToken | null
  loading: boolean
  config: ConfigType
}

type AuthorizerContextActions = {
  setLoading: (loading: boolean) => void
  setToken: (token: AuthToken | null) => void
  setUser: (user: User | null) => void
  setAuthData: (data: AuthorizerState) => void
  authorizer: () => Authorizer
  logout: () => Promise<void>
}
const config: ConfigType = {
  authorizerURL: 'https://auth.discours.io',
  redirectURL: 'https://discoursio-webapp.vercel.app/?modal=auth',
  clientID: '9c113377-5eea-4c89-98e1-69302462fc08', // FIXME: use env?
}

const AuthorizerContext = createContext<[AuthorizerState, AuthorizerContextActions]>([
  {
    config,
    user: null,
    token: null,
    loading: false,
  },
  {
    setLoading: () => {},
    setToken: () => {},
    setUser: () => {},
    setAuthData: () => {},
    authorizer: () => new Authorizer(config),
    logout: async () => {},
  },
])

type AuthorizerProviderProps = {
  onStateChangeCallback?: (stateData: AuthorizerState) => void
}

export const AuthorizerProvider: ParentComponent<AuthorizerProviderProps> = (props) => {
  const [state, setState] = createStore<AuthorizerState>({
    user: null,
    token: null,
    loading: true,
    config,
  })
  const authorizer = createMemo(
    () =>
      new Authorizer({
        authorizerURL: state.config.authorizerURL,
        redirectURL: state.config.redirectURL,
        clientID: state.config.clientID,
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
    } catch {
      setState((prev) => ({ ...prev, user: null, token: null }))
    } finally {
      setState('config', (cfg) => ({ ...cfg, ...metaRes }))
      setState('loading', false)
    }
  }

  onMount(() => {
    setState('config', { ...config, redirectURL: window.location.origin + '/?modal=auth' })
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
