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
  layout?: LayoutType
  // other types?
  searchResults?: Shout[]
  chats?: Chat[]
  test?: string
}

export type RootSearchParams = {
  modal: string
  lang: string
}

export type LayoutType = 'article' | 'audio' | 'video' | 'image' | 'literature'

export type FileTypeToUpload = 'image' | 'video' | 'doc' | 'audio'

export type MediaItem = {
  url: string
  title: string
  body: string
  source?: string // for image
  pic?: string

  // audio specific properties
  date?: string
  genre?: string
  artist?: string
  lyrics?: string
}

export type UploadedFile = {
  url: string
  originalFilename?: string
}
