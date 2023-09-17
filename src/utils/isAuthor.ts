import { Author, Topic } from '../graphql/types.gen'

export const isAuthor = (value: Author | Topic): value is Author => {
  return 'name' in value
}
