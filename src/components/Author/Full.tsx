import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from './Card'
import './Full.scss'

export const AuthorFull = (props: { author: Author }) => {
  return (
    <div class="row">
      <div class="col-md-9 col-lg-8 user-details">
        <AuthorCard author={props.author} isAuthorPage={true} />
      </div>
    </div>
  )
}
