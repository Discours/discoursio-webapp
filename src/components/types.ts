// in a separate file to avoid circular dependencies
import type { Author, Shout, Topic } from '../graphql/types.gen'

// all the things (she said) that could be passed from the server
export type PageProps = {
  randomTopics?: Topic[]
  article?: Shout
  authorArticles?: Shout[]
  topicArticles?: Shout[]
  homeArticles?: Shout[]
  author?: Author
  allAuthors?: Author[]
  topic?: Topic
  allTopics?: Topic[]
  searchQuery?: string
  // other types?
  searchResults?: Shout[]
}
