import type { Reaction, ReactionKind } from '../graphql/types.gen'

export const checkReaction = (
  reactions: Reaction[],
  reactionKind: ReactionKind,
  userSlug: string,
  shoutId: number
) =>
  reactions.some(
    (r) => r.kind === reactionKind && r.createdBy.slug === userSlug && r.shout.id === shoutId && !r.replyTo
  )
