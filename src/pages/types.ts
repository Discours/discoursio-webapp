// in a separate file to avoid circular dependencies
import type { Chat } from '../graphql/schema/chat.gen'
import type { Author, SearchResult, Shout, Topic } from '../graphql/schema/core.gen'
// all the things (she said) that could be passed from the server
export type PageProps = {
  article?: Shout
  expoShouts?: Shout[]
  authorShouts?: Shout[]
  topicShouts?: Shout[]
  homeShouts?: Shout[]
  author?: Author
  allAuthors?: Author[]
  topWritingAuthors?: Author[]
  topFollowedAuthors?: Author[]
  topic?: Topic
  allTopics?: Topic[]
  searchQuery?: string
  layouts?: LayoutType[]
  // other types?
  searchResults?: SearchResult[]
  chats?: Chat[]
  seo: {
    title: string
  }
}

export type RootSearchParams = {
  m: string // modal
  lang: string
  token: string
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

export type FollowsFilter = 'all' | 'authors' | 'topics' | 'communities'
