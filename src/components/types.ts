// in a separate file to avoid circular dependencies
import type { Author, Chat, Shout, Topic } from '../graphql/types.gen'
import type { LayoutType } from '../stores/zine/layouts'

// all the things (she said) that could be passed from the server
export type PageProps = {
  randomTopics?: Topic[]
  article?: Shout
  shouts?: Shout[]
  author?: Author
  allAuthors?: Author[]
  topic?: Topic
  allTopics?: Topic[]
  searchQuery?: string
  layout?: LayoutType
  // other types?
  searchResults?: Shout[]
  chats?: Chat[]
}
