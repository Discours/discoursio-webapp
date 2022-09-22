import type { Topic } from '../../graphql/types.gen'
import { Icon } from '../Nav/Icon'
import './FloorHeader.scss'
import { t } from '../../utils/intl'

export default (props: { topic: Topic; color: string }) => {
  return (
    <>
      <h3 class="col-sm-6">{props.topic.title}</h3>
      <div class="col-sm-6 all-materials">
        <a href={`/topic/${props.topic.slug}`}>
          {t('All posts')}
          <Icon name={`arrow-right-${props.color}`} />
        </a>
      </div>
    </>
  )
}
