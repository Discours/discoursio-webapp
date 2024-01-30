import type { Accessor, JSX, Resource } from 'solid-js'

import { createContext, createSignal, createResource, onMount, useContext, createEffect } from 'solid-js'

import { useSession } from './session'
import { apiClient } from '../graphql/client/core'
import { Author, Community, FollowingEntity, Topic } from '../graphql/schema/core.gen'

type SubscriptionsData = {
  topics?: Topic[]
  authors?: Author[]
  communities?: Community[]
}

interface FollowingContextType {
  //author: Resource<Author | null>
  isLoaded: Accessor<Boolean>
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

const EMPTY_SUBSCRIPTIONS = {
  topics: [],
  authors: [],
  communities: [],
}

export const FollowingProvider = (props: { children: JSX.Element }) => {
  const [isLoaded, setIsLoaded] = createSignal<Boolean>()
  const { author } = useSession()

  const fetchData = async () => {
    let s = null
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

        if (!updatedSubs[what]) {
          // If the property for the entity type doesn't exist, create it
          updatedSubs[what] = []
        }

        // Check if the entity already exists in the array
        const exists = updatedSubs[what]?.some((entity) => entity.slug === slug)

        if (!exists) {
          // If not, add the new entity to the array
          updatedSubs[what].push(slug)
        }

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

        // Remove the entity from the array
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
    initialValue: null,
  })

  createEffect(() => {
    if (author() && subscriptions() === EMPTY_SUBSCRIPTIONS) loadSubscriptions()
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
