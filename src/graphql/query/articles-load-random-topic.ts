import { gql } from '@urql/core'

export default gql`
  query LoadRandomTopicShoutsQuery($limit: Int!) {
    loadRandomTopicShouts(limit: $limit) {
      topic {
        id
        title
        body
        slug
        pic
        # community
        stat {
          shouts
          authors
          followers
          # viewed
        }
      }
      shouts {
        id
        title
        lead
        description
        subtitle
        slug
        layout
        cover
        lead
        # community
        mainTopic
        topics {
          id
          title
          body
          slug
          stat {
            shouts
            authors
            followers
          }
        }
        authors {
          id
          name
          slug
          userpic
          createdAt
          bio
        }
        createdAt
        publishedAt
        stat {
          viewed
          reacted
          rating
          commented
        }
      }
    }
  }
`
