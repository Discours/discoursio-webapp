import { Accessor, JSX, createContext, createEffect, createSignal, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

import { apiClient } from '../graphql/client/core'
import { AuthorFollows, FollowingEntity, Author } from '../graphql/schema/core.gen'

import { useSession } from './session'

interface FollowingContextType {
  loading: Accessor<boolean>
  followers: Accessor<Array<Author>>
  subscriptions: AuthorFollows
  setSubscriptions: (subscriptions: AuthorFollows) => void
  setFollowing: (what: FollowingEntity, slug: string, value: boolean) => void
  loadSubscriptions: () => void
  follow: (what: FollowingEntity, slug: string) => Promise<void>
  unfollow: (what: FollowingEntity, slug: string) => Promise<void>
  isOwnerSubscribed: (id: number | string) => boolean
}

const FollowingContext = createContext<FollowingContextType>()

export function useFollowing() {
  return useContext(FollowingContext)
}

const EMPTY_SUBSCRIPTIONS: AuthorFollows = {
  topics: [],
  authors: [],
  communities: [],
}

export const FollowingProvider = (props: { children: JSX.Element }) => {
  const [loading, setLoading] = createSignal<boolean>(false)
  const [followers, setFollowers] = createSignal<Array<Author>>([])
  const [subscriptions, setSubscriptions] = createStore<AuthorFollows>(EMPTY_SUBSCRIPTIONS)
  const { author, session } = useSession()

  const fetchData = async () => {
    setLoading(true)
    try {
      if (apiClient.private) {
        console.debug('[context.following] fetching subs data...')
        const result = await apiClient.getAuthorFollows({ user: session()?.user.id })
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
      try {
        const { authors, followers, topics } = session().user.app_data
        setSubscriptions({ authors, topics })
        setFollowers(followers)
        if(!authors) fetchData()
      } catch(e) {
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

  const isOwnerSubscribed = (id?: number | string) => {
    if (!author() || !subscriptions) return
    const isAuthorSubscribed = subscriptions.authors?.some((authorEntity) => authorEntity.id === id)
    const isTopicSubscribed = subscriptions.topics?.some((topicEntity) => topicEntity.slug === id)
    return !!isAuthorSubscribed || !!isTopicSubscribed
  }

  const value: FollowingContextType = {
    loading,
    subscriptions,
    setSubscriptions,
    isOwnerSubscribed,
    setFollowing,
    followers,
    loadSubscriptions: fetchData,
    follow,
    unfollow,
  }

  return <FollowingContext.Provider value={value}>{props.children}</FollowingContext.Provider>
}
