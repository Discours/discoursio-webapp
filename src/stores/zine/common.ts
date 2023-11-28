import { apiClient } from '../../graphql/client/core'
import { FollowingEntity } from '../../graphql/schema/core.gen'

export const follow = async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
  await apiClient.follow({ what, slug })
}
export const unfollow = async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
  await apiClient.unfollow({ what, slug })
}
