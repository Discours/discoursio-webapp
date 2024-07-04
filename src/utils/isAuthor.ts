import { Author, Topic } from '~/graphql/schema/core.gen'

export const isAuthor = (value: Author | Topic): value is Author => {
  return 'name' in value
}
