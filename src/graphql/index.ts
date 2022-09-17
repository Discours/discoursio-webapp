// auth
import signIn from './query/auth-login'
import signUp from './mutation/auth-register'
import signOut from './mutation/auth-logout'
import checkEmail from './query/auth-check-email'
import getSession from './mutation/my-session'
// articles
import topOverall from './query/articles-top-rated'
import topViewed from './query/articles-top-viewed'
import topMonth from './query/articles-top-month'
import recentPublished from './query/articles-recent-published'
import recentAll from './query/articles-recent-all'
import articlesForTopics from './query/articles-for-topics'
import articlesForAuthors from './query/articles-for-authors'
// article
import articleBySlug from './query/article-by-slug'
import articleComments from './query/article-reactions'
import articleCreate from './mutation/article-create'
import articleUpdate from './mutation/article-update'
// author
import authorBySlug from './query/authors-by-slugs'
import authorComments from './query/author-reactions'
import authorRoles from './query/author-roles'
import authorFollowers from './query/author-followers'
import authorFollowing from './query/author-following'
// topics
import topicsAll from './query/topics-all'
// comment
import commentCreate from './mutation/reaction-create'
import commentUpdate from './mutation/reaction-update'
import commentDestroy from './mutation/reaction-destroy'
import type { OperationResult } from '@urql/core'
import type { Author, Shout, Topic, User } from './types.gen'
import type { DefinitionNode } from 'graphql'

export const handleUpdate = (gresponse: OperationResult<any, object>) => {
  if (!gresponse) {
    console.error('[graphql] no result operation')
    return gresponse
  }

  const { data, error } = gresponse

  if (error) {
    const e = error
    const { message: body } = e
    const {
      operation: {
        query: { definitions: defs }
      }
    } = gresponse
    defs.forEach((def: DefinitionNode) => {
      const {
        name: { value: title }
      } = def as any
      console.error('[graphql] error with', title || '')
      console.error(body)
    })
  }

  if (!data) {
    console.warn('[graphql] no data')
    return data
  }

  const [query, value] = Object.entries(data)[0]
  let l, add

  if (typeof value === 'object') {
    const { error: qerror } = value as any
    if (qerror) {
      console.error('[graphql] response with error', qerror)
    }
    l = 1
    add = ' entry ' + (value as Author | Topic | User | Shout).slug || ''
  }

  if (Array.isArray(value)) {
    l = value.length
    add = ' entries from ' + query
  }
  console.debug('[graphql] ' + l + add)
  return value
}

export default {
  recentPublished,
  recentAll,
  topMonth,
  topOverall,
  topViewed,
  signIn,
  signOut,
  signUp,
  checkEmail,
  getSession,
  authorBySlug,
  authorComments,
  authorRoles,
  authorFollowers,
  authorFollowing,
  articleBySlug,
  articleComments,
  articleCreate,
  articleUpdate,
  articlesForAuthors,
  articlesForTopics,
  topicsAll,
  commentCreate,
  commentDestroy,
  commentUpdate
}
