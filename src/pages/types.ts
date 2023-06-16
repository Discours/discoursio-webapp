// in a separate file to avoid circular dependencies
import type { Author, Chat, Shout, Topic } from '../graphql/types.gen'

// all the things (she said) that could be passed from the server
export type PageProps = {
  randomTopics?: Topic[]
  article?: Shout
  layoutShouts?: Shout[]
  authorShouts?: Shout[]
  topicShouts?: Shout[]
  homeShouts?: Shout[]
  author?: Author
  allAuthors?: Author[]
  topic?: Topic
  allTopics?: Topic[]
  searchQuery?: string
  layout?: string // LayoutType
  // other types?
  searchResults?: Shout[]
  chats?: Chat[]
}

export type RootSearchParams = {
  modal: string
  lang: string
}

export type UploadFile = {
  source: string
  name: string
  size: number
  file: File
}
