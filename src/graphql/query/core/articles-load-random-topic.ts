import { gql } from '@urql/core'

export default gql`
  query LoadRandomTopicShoutsQuery($limit: Int!) {
    load_shouts_random_topic(limit: $limit) {
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
        main_topic
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
          pic
          created_at
          bio
        }
        created_at
        published_at
        featured_at
        stat {
          viewed
          rating
          commented
        }
      }
    }
  }
`
