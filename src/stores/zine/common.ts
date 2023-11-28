import type { FollowingEntity } from '../../graphql/schema/core.gen'

import { apiClient } from '../../graphql/client/core'

export const follow = async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
  await apiClient.follow({ what, slug })
}
export const unfollow = async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
  await apiClient.unfollow({ what, slug })
}
