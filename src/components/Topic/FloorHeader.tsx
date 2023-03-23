import type { Topic } from '../../graphql/types.gen'
import { Icon } from '../_shared/Icon'
import './FloorHeader.scss'
import { useLocalize } from '../../context/localize'

export default (props: { topic: Topic; color: string }) => {
  const { t } = useLocalize()
  return (
    <>
      <h3 class="col-sm-12">{props.topic.title}</h3>
      <div class="col-sm-12 all-materials">
        <a href={`/topic/${props.topic.slug}`}>
          {t('All posts')}
          <Icon name={`arrow-right-${props.color}`} />
        </a>
      </div>
    </>
  )
}
