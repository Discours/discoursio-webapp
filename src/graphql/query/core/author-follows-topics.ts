import { gql } from '@urql/core'

export default gql`
    query GetAuthorFollowsTopics($slug: String, $user: String, $author_id: Int) {
        get_author_follows_topics(slug: $slug, user: $user, author_id: $author_id) {
            id
            slug
            title
            stat {
                shouts
                authors
                followers
            }
        }
    }
`
