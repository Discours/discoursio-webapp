import { Accessor, JSX, createContext, createEffect, createSignal, useContext, createMemo } from "solid-js";
import { createStore } from 'solid-js/store'

import { apiClient } from '../graphql/client/core'
import { Author, AuthorFollows, Community, FollowingEntity, Topic } from "../graphql/schema/core.gen";

import { useSession } from './session'

export type SubscriptionsData = {
  topics?: Topic[]
  authors?: Author[]
  communities?: Community[]
}

type SubscribeAction = { slug: string; type: 'subscribe' | 'unsubscribe' }

interface FollowingContextType {
  loading: Accessor<boolean>
  subscriptions: AuthorFollows
  setSubscriptions: (subscriptions: AuthorFollows) => void
  setFollowing: (what: FollowingEntity, slug: string, value: boolean) => void
  loadSubscriptions: () => void
  follow: (what: FollowingEntity, slug: string) => Promise<void>
  unfollow: (what: FollowingEntity, slug: string) => Promise<void>
  isOwnerSubscribed: (id: number | string) => Accessor<boolean>
  // followers: Accessor<Author[]>
  subscribeInAction?: Accessor<SubscribeAction>
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
  const [subscriptions, setSubscriptions] = createStore<SubscriptionsData>(EMPTY_SUBSCRIPTIONS)
  const { session, author } = useSession()
  const [subscribeInAction, setSubscribeInAction] = createSignal<SubscribeAction>()

  const fetchData = async () => {
    setLoading(true)
    try {
      if (apiClient.private) {
        console.debug('[context.following] fetching subs data...')
        console.log("%c!!! session()?.user.id:", 'background: #222; color: #bada55', session());

        const result = await apiClient.getAuthorFollows({ user: session()?.user.id })
        console.log("!!! result:", result);
        setSubscriptions(result || EMPTY_SUBSCRIPTIONS)
      }
    } catch (error) {
      console.info('[context.following] cannot get subs', error)
    } finally {
      setLoading(false)
    }
  }

  createEffect(() => {
    console.info('[context.following] subs:', subscriptions);
  })


  const follow = async (what: FollowingEntity, slug: string) => {
    if (!author()) return;
    setSubscribeInAction({ slug, type: 'subscribe' });
    try {
      const subscriptionData = await apiClient.follow({ what, slug });
      setSubscriptions((prevSubscriptions) => {
        if (!prevSubscriptions[what]) prevSubscriptions[what] = [];
        prevSubscriptions[what].push(subscriptionData);
        return prevSubscriptions;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSubscribeInAction(); // Сбрасываем состояние действия подписки.
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
    // console.log("!!! cone setSubscribeInAction:", subscribeInAction());
    // if (author()) {
    //   console.debug('[context.following] author update detect')
    //   fetchData()
    // }
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

  const isOwnerSubscribed = (id?: number | string) => createMemo(() => {
    console.log('%c!!! WTF:', 'color: #bada55', subscriptions);
    if (!author() || !subscriptions) return false;
    const isAuthorSubscribed = subscriptions.authors?.some((authorEntity) => authorEntity.id === id);
    const isTopicSubscribed = subscriptions.topics?.some((topicEntity) => topicEntity.slug === id);
    return !!isAuthorSubscribed || !!isTopicSubscribed;
  })

  const value: FollowingContextType = {
    loading,
    subscriptions,
    setSubscriptions,
    isOwnerSubscribed,
    setFollowing,
    loadSubscriptions: fetchData,
    follow,
    unfollow,
    // followers,
    subscribeInAction,
  }

  return <FollowingContext.Provider value={value}>{props.children}</FollowingContext.Provider>
}
