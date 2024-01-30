import type { Accessor, JSX, Resource } from 'solid-js'

import { createContext, createSignal, createResource, useContext, createEffect, untrack } from 'solid-js'

import { apiClient } from '../graphql/client/core'
import { Author, Community, FollowingEntity, Topic } from '../graphql/schema/core.gen'

import { useSession } from './session'

type SubscriptionsData = {
  topics?: Topic[]
  authors?: Author[]
  communities?: Community[]
}

interface FollowingContextType {
  //author: Resource<Author | null>
  isLoaded: Accessor<boolean>
  subscriptions: Resource<SubscriptionsData>
  actions: {
    setSubscriptions: (sss) => void
    loadSubscriptions: () => void
    follow: (what: FollowingEntity, slug: string) => Promise<void>
    unfollow: (what: FollowingEntity, slug: string) => Promise<void>
  }
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
  const [isLoaded, setIsLoaded] = createSignal<boolean>()
  const { author } = useSession()

  const fetchData = async () => {
    const s = null
    try {
      const result = await apiClient.getMySubscriptions()
      setSubscriptions(result || EMPTY_SUBSCRIPTIONS)
      setIsLoaded(true)
    } catch (error) {
      console.info('[context.following] cannot get subs', error)
      setIsLoaded(true)
    }
    return s
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

  const [subscriptions, { refetch: loadSubscriptions, mutate: setSubscriptions }] = createResource<{
    topics?: Topic[]
    authors?: Author[]
    communities?: Community[]
  }>(fetchData, {
    ssrLoadFrom: 'initial',
    initialValue: EMPTY_SUBSCRIPTIONS,
  })

  createEffect(() => {
    if (author() && subscriptions() === EMPTY_SUBSCRIPTIONS)
      untrack(() => {
        loadSubscriptions()
      })
  })

  const value: FollowingContextType = {
    isLoaded,
    subscriptions,
    actions: {
      loadSubscriptions,
      setSubscriptions,
      follow,
      unfollow,
    },
  }
  return <FollowingContext.Provider value={value}>{props.children}</FollowingContext.Provider>
}
