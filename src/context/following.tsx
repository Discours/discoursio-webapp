import { createEffect, createSignal, createContext, Accessor, useContext, JSX } from 'solid-js'
import { createStore } from 'solid-js/store'

import { apiClient } from '../graphql/client/core'
import { Author, Community, FollowingEntity, Topic } from '../graphql/schema/core.gen'

import { useSession } from './session'

type SubscriptionsData = {
  topics?: Topic[]
  authors?: Author[]
  communities?: Community[]
}

interface FollowingContextType {
  isLoaded: Accessor<boolean>
  subscriptions: SubscriptionsData
  setSubscriptions: (subscriptions: SubscriptionsData) => void
  loadSubscriptions: () => void
  follow: (what: FollowingEntity, slug: string) => Promise<void>
  unfollow: (what: FollowingEntity, slug: string) => Promise<void>
}

const FollowingContext = createContext<FollowingContextType>()

export function useFollowing() {
  return useContext(FollowingContext)
}

export const EMPTY_SUBSCRIPTIONS = {
  topics: [],
  authors: [],
  communities: [],
}

export const FollowingProvider = (props: { children: JSX.Element }) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>(false)
  const [subscriptions, setSubscriptions] = createStore<SubscriptionsData>(EMPTY_SUBSCRIPTIONS)
  const { author } = useSession()

  const fetchData = async () => {
    try {
      const result = await apiClient.getMySubscriptions()
      setSubscriptions(result || EMPTY_SUBSCRIPTIONS)
      setIsLoaded(true)
    } catch (error) {
      console.info('[context.following] cannot get subs', error)
      setIsLoaded(true)
    }
  }

  const follow = async (what: FollowingEntity, slug: string) => {
    try {
      await apiClient.follow({ what, slug })
      setSubscriptions((prevSubscriptions) => {
        const updatedSubs = { ...prevSubscriptions }
        if (!updatedSubs[what]) updatedSubs[what] = []
        const exists = updatedSubs[what]?.some((entity) => entity.slug === slug)
        if (!exists) updatedSubs[what].push(slug)
        return updatedSubs
      })
    } catch (error) {
      console.error(error)
    }
  }

  const unfollow = async (what: FollowingEntity, slug: string) => {
    try {
      await apiClient.unfollow({ what, slug })
      setSubscriptions((prevSubscriptions) => {
        const updatedSubs = { ...prevSubscriptions }
        updatedSubs[what] = (updatedSubs[what] || []).filter((x) => x !== slug)
        return updatedSubs
      })
    } catch (error) {
      console.error(error)
    }
  }

  createEffect(() => {
    if (author() && subscriptions === EMPTY_SUBSCRIPTIONS) fetchData()
  })

  const value: FollowingContextType = {
    isLoaded,
    subscriptions,
    setSubscriptions,
    loadSubscriptions: fetchData,
    follow,
    unfollow,
  }

  return <FollowingContext.Provider value={value}>{props.children}</FollowingContext.Provider>
}
