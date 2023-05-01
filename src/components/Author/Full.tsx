import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from './AuthorCard'
import './Full.scss'

export const AuthorFull = (props: { author: Author }) => {
  return (
    <div class="row">
      <div class="col-md-18 col-lg-16 user-details">
        <AuthorCard author={props.author} isAuthorPage={true} />
      </div>
    </div>
  )
}
