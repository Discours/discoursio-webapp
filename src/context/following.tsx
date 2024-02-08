import { Accessor, JSX, createContext, createEffect, createSignal, useContext } from 'solid-js'
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
  loading: Accessor<boolean>
  subscriptions: SubscriptionsData
  setSubscriptions: (subscriptions: SubscriptionsData) => void
  setFollowing: (what: FollowingEntity, slug: string, value: boolean) => void
  loadSubscriptions: () => void
  follow: (what: FollowingEntity, slug: string) => Promise<void>
  unfollow: (what: FollowingEntity, slug: string) => Promise<void>
  isOwnerSubscribed: (userId: number) => boolean
}

const FollowingContext = createContext<FollowingContextType>()

export function useFollowing() {
  return useContext(FollowingContext)
}

const EMPTY_SUBSCRIPTIONS = {
  topics: [],
  authors: [],
  communities: []
}

export const FollowingProvider = (props: { children: JSX.Element }) => {
  const [loading, setLoading] = createSignal<boolean>(false)
  const [subscriptions, setSubscriptions] = createStore<SubscriptionsData>(EMPTY_SUBSCRIPTIONS)
  const { author } = useSession()

  const fetchData = async () => {
    setLoading(true)
    try {
      if (apiClient.private) {
        console.debug('[context.following] fetching subs data...')
        const result = await apiClient.getMySubscriptions()
        setSubscriptions(result || EMPTY_SUBSCRIPTIONS)
        console.info('[context.following] subs:', subscriptions)
      }
    } catch (error) {
      console.info('[context.following] cannot get subs', error)
    } finally {
      setLoading(false)
    }
  }

  const follow = async (what: FollowingEntity, slug: string) => {
    if (!author()) return
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
    if (!author()) return
    try {
      await apiClient.unfollow({ what, slug })
    } catch (error) {
      console.error(error)
    }
  }

  createEffect(() => {
    if (author()) {
      console.debug('[context.following] author update detect')
      fetchData()
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

  const isOwnerSubscribed = (userId: number) => {
    if (!author()) return
    return !!subscriptions?.authors?.some((authorEntity) => authorEntity.id === userId)
  }

  const value: FollowingContextType = {
    loading,
    subscriptions,
    setSubscriptions,
    isOwnerSubscribed,
    setFollowing,
    loadSubscriptions: fetchData,
    follow,
    unfollow
  }

  return <FollowingContext.Provider value={value}>{props.children}</FollowingContext.Provider>
}
