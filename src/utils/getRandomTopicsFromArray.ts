import { RANDOM_TOPICS_COUNT } from '../components/Views/Home'
import { Topic } from '../graphql/schema/core.gen'

export const getRandomTopicsFromArray = (topics: Topic[], count: number = RANDOM_TOPICS_COUNT): Topic[] => {
  const shuffledTopics = [...topics].sort(() => 0.5 - Math.random())
  return shuffledTopics.slice(0, count)
}
