import { Icon } from '../_shared/Icon'
import { useLocalize } from '../../context/localize'
import './Topics.scss'

export const NavTopics = () => {
  const { t } = useLocalize()

  return (
    <nav class="subnavigation wide-container text-2xl">
      <ul class="topics">
        <li class="item">
          <a href="/expo/image">Искусство</a>
        </li>
        <li class="item">
          <a href="/podcasts">Подкасты</a>
        </li>
        <li class="item">
          <a href="">Спецпроекты</a>
        </li>
        <li class="item">
          <a href="/topic/interview">#Интервью</a>
        </li>
        <li class="item">
          <a href="/topic/reportage">#Репортажи</a>
        </li>
        <li class="item">
          <a href="/topic/empiric">#Личный опыт</a>
        </li>
        <li class="item">
          <a href="/topic/society">#Общество</a>
        </li>
        <li class="item">
          <a href="/topic/culture">#Культура</a>
        </li>
        <li class="item">
          <a href="/topic/theory">#Теории</a>
        </li>
        <li class="item">
          <a href="/topic/poetry">#Поэзия</a>
        </li>
        <li class="item right">
          <a href={`/topics`}>
            <span>
              {t('All topics')}
              <Icon name="arrow-right-black" class={'icon'} />
            </span>
          </a>
        </li>
      </ul>
    </nav>
  )
}
