import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from './Card'
import './Full.scss'

export const AuthorFull = (props: { author: Author }) => {
  return (
    <div class="row">
      <div class="col-md-8 offset-md-2 user-details">
        <AuthorCard author={props.author} compact={false} isAuthorPage={true} />
      </div>
    </div>
  )
}
