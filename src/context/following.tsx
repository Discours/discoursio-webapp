import { Accessor, JSX, createContext, createEffect, createSignal, on, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

import { apiClient } from '../graphql/client/core'
import { Author, AuthorFollowsResult, FollowingEntity } from '../graphql/schema/core.gen'

import { useSession } from './session'

type FollowingData = { slug: string; type: 'follow' | 'unfollow' }

interface FollowingContextType {
  loading: Accessor<boolean>

  followers: Accessor<Author[]>
  setFollows: (follows: AuthorFollowsResult) => void

  following: Accessor<FollowingData>
  changeFollowing: (what: FollowingEntity, slug: string, value: boolean) => void

  follows: AuthorFollowsResult
  loadFollows: () => void

  follow: (what: FollowingEntity, slug: string) => Promise<void>
  unfollow: (what: FollowingEntity, slug: string) => Promise<void>
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
  const [followers, setFollowers] = createSignal<Author[]>([])
  const [follows, setFollows] = createStore<AuthorFollowsResult>(EMPTY_SUBSCRIPTIONS)
  const { author, session } = useSession()

  const fetchData = async () => {
    setLoading(true)
    try {
      if (apiClient.private) {
        console.debug('[context.following] fetching subs data...')
        const result = await apiClient.getAuthorFollows({ user: session()?.user.id })
        setFollows(result || EMPTY_SUBSCRIPTIONS)
      }
    } catch (error) {
      console.info('[context.following] cannot get subs', error)
    } finally {
      setLoading(false)
    }
  }

  const [following, setFollowing] = createSignal<FollowingData>()
  const follow = async (what: FollowingEntity, slug: string) => {
    if (!author()) return
    setFollowing({ slug, type: 'follow' })
    try {
      const result = await apiClient.follow({ what, slug })
      setFollows((subs) => {
        if (result.authors) subs['authors'] = result.authors || []
        if (result.topics) subs['topics'] = result.topics || []
        return subs
      })
    } catch (error) {
      console.error(error)
    } finally {
      setFollowing() // Сбрасываем состояние действия подписки.
    }
  }

  const unfollow = async (what: FollowingEntity, slug: string) => {
    if (!author()) return
    setFollowing({ slug: slug, type: 'unfollow' })
    try {
      const result = await apiClient.unfollow({ what, slug })
      setFollows((subs) => {
        if (result.authors) subs['authors'] = result.authors || []
        if (result.topics) subs['topics'] = result.topics || []
        return subs
      })
    } catch (error) {
      console.error(error)
    } finally {
      setFollowing()
    }
  }

  createEffect(
    on(
      () => session()?.user.app_data,
      (appdata) => {
        if (appdata) {
          const { authors, followers, topics } = appdata
          setFollows({ authors, topics })
          setFollowers(followers)
          if (!authors) fetchData()
        }
      },
    ),
  )

  const changeFollowing = (what: FollowingEntity, slug: string, value = true) => {
    setFollows((fff) => {
      const updatedSubs = { ...fff }
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
    follows,
    setFollows,
    following,
    changeFollowing,
    followers,
    loadFollows: fetchData,
    follow,
    unfollow,
  }

  return <FollowingContext.Provider value={value}>{props.children}</FollowingContext.Provider>
}
