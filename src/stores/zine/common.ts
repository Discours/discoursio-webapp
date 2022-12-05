import type { FollowingEntity } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'

export const follow = async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
  console.log('!!! follow:')
  await apiClient.follow({ what, slug })
  // refresh session
  // TODO: _store update code
}
export const unfollow = async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
  await apiClient.unfollow({ what, slug })
  // TODO: store update
}
