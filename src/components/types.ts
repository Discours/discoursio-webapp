// in a separate file to avoid circular dependencies
import type { Author, Shout, Topic } from '../graphql/types.gen'

// all the things (she said) that could be passed from the server
export type PageProps = {
  article?: Shout
  articles?: Shout[]
  author?: Author
  authors?: Author[]
  topic?: Topic
  topics?: Topic[]
  searchQuery?: string
  // other types?
  searchResults?: Shout[]
}
