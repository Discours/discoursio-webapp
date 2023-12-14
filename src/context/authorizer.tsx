import type { ParentComponent } from 'solid-js'

import { Authorizer, User, AuthToken, ConfigType } from '@authorizerdev/authorizer-js'
import { createContext, createEffect, createMemo, onMount, useContext } from 'solid-js'
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

  const interval: number | null = null

  const getToken = async () => {
    setState('loading', true)
    const metaRes = await authorizer().getMetaData()
    setState('config', (cfg) => ({ ...cfg, ...metaRes }))
    setState('loading', false)
  }

  onMount(() => {
    setState('config', { ...config, redirectURL: window.location.origin + '/?modal=auth' })
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
