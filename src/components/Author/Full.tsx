import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from './Card'
import './Full.scss'

export default (props: { author: Author }) => {
  return (
    <div class="container">
      <div class="row">
        <div class="user-details">
          <AuthorCard author={props.author} compact={false} isAuthorPage={true} />
        </div>
      </div>
    </div>
  )
}
