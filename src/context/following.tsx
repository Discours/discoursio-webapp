import { Accessor, JSX, createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

import { apiClient } from '../graphql/client/core'
import { Author, AuthorFollowsResult, FollowingEntity } from '../graphql/schema/core.gen'

import { useSession } from './session'

export type SubscriptionsData = {
  topics?: Topic[]
  authors?: Author[]
  communities?: Community[]
}

type SubscribeAction = { slug: string; type: 'subscribe' | 'unsubscribe' }

interface FollowingContextType {
  loading: Accessor<boolean>
  followers: Accessor<Array<Author>>
  subscriptions: AuthorFollowsResult
  setSubscriptions: (subscriptions: AuthorFollowsResult) => void
  setFollowing: (what: FollowingEntity, slug: string, value: boolean) => void
  loadSubscriptions: () => void
  follow: (what: FollowingEntity, slug: string) => Promise<void>
  unfollow: (what: FollowingEntity, slug: string) => Promise<void>
  // followers: Accessor<Author[]>
  subscribeInAction?: Accessor<SubscribeAction>
}

const FollowingContext = createContext<FollowingContextType>()

export function useFollowing() {
  return useContext(FollowingContext)
}

const EMPTY_SUBSCRIPTIONS: AuthorFollowsResult = {
  topics: [],
  authors: [],
  communities: [],
}

export const FollowingProvider = (props: { children: JSX.Element }) => {
  const [loading, setLoading] = createSignal<boolean>(false)
  const [followers, setFollowers] = createSignal<Array<Author>>([])
  const [subscriptions, setSubscriptions] = createStore<AuthorFollowsResult>(EMPTY_SUBSCRIPTIONS)
  const { author, session } = useSession()

  const fetchData = async () => {
    setLoading(true)
    try {
      if (apiClient.private) {
        console.debug('[context.following] fetching subs data...')
        const result = await apiClient.getAuthorFollows({ user: session()?.user.id })
        setSubscriptions(result || EMPTY_SUBSCRIPTIONS)
      }
    } catch (error) {
      console.info('[context.following] cannot get subs', error)
    } finally {
      setLoading(false)
    }
  }

  createEffect(() => {
    console.info('[context.following] subs:', subscriptions)
  })

  const follow = async (what: FollowingEntity, slug: string) => {
    if (!author()) return
    setSubscribeInAction({ slug, type: 'subscribe' })
    try {
      const subscriptionData = await apiClient.follow({ what, slug })
      setSubscriptions((prevSubscriptions) => {
        if (!prevSubscriptions[what]) prevSubscriptions[what] = []
        prevSubscriptions[what].push(subscriptionData)
        return prevSubscriptions
      })
    } catch (error) {
      console.error(error)
    } finally {
      setSubscribeInAction() // Сбрасываем состояние действия подписки.
    }
  }

  const unfollow = async (what: FollowingEntity, slug: string) => {
    if (!author()) return
    setSubscribeInAction({ slug: slug, type: 'unsubscribe' })
    try {
      await apiClient.unfollow({ what, slug })
    } catch (error) {
      console.error(error)
    } finally {
      setSubscribeInAction()
    }
  }

  createEffect(() => {
    if (author()) {
      try {
        const appdata = session()?.user.app_data
        if (appdata) {
          const { authors, followers, topics } = appdata
          setSubscriptions({ authors, topics })
          setFollowers(followers)
          if (!authors) fetchData()
        }
      } catch (e) {
        console.error(e)
      }
    }
  })

  const setFollowing = (what: FollowingEntity, slug: string, value = true) => {
    setSubscriptions((prevSubscriptions) => {
      const updatedSubs = { ...prevSubscriptions }
      if (!updatedSubs[what]) updatedSubs[what] = []
      if (value) {
        const exists = updatedSubs[what]?.some((entity) => entity.slug === slug)
        if (!exists) updatedSubs[what].push(slug)
      } else {
        updatedSubs[what] = (updatedSubs[what] || []).filter((x) => x !== slug)
      }
      return updatedSubs
    })
    try {
      ;(value ? follow : unfollow)(what, slug)
    } catch (error) {
      console.error(error)
    } finally {
      fetchData()
    }
  }

  const value: FollowingContextType = {
    loading,
    subscriptions,
    setSubscriptions,
    setFollowing,
    followers,
    loadSubscriptions: fetchData,
    follow,
    unfollow,
    // followers,
    subscribeInAction,
  }

  return <FollowingContext.Provider value={value}>{props.children}</FollowingContext.Provider>
}
