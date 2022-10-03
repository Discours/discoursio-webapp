import { createMemo } from 'solid-js'
import { useArticlesStore } from './articles'
import { useAuthorsStore } from './authors'

const TOP_AUTHORS_COUNT = 5

export const useTopAuthorsStore = () => {
  const { articlesByAuthor } = useArticlesStore()
  const { authorEntities } = useAuthorsStore()

  const topAuthors = createMemo(() => {
    return Object.keys(articlesByAuthor())
      .sort((authorSlug1, authorSlug2) => {
        const author1Rating = articlesByAuthor()[authorSlug1].reduce(
          (acc, article) => acc + article.stat?.rating,
          0
        )
        const author2Rating = articlesByAuthor()[authorSlug2].reduce(
          (acc, article) => acc + article.stat?.rating,
          0
        )
        if (author1Rating === author2Rating) {
          return 0
        }

        return author1Rating > author2Rating ? 1 : -1
      })
      .slice(0, TOP_AUTHORS_COUNT)
      .map((authorSlug) => authorEntities()[authorSlug])
      .filter(Boolean)
  })

  return { topAuthors }
}
