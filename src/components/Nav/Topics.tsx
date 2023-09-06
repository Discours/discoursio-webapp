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
          <a href="">Подкасты</a>
        </li>
        <li class="item">
          <a href="">Спецпроекты</a>
        </li>
        <li class="item">
          <a href="">#Интервью</a>
        </li>
        <li class="item">
          <a href="">#Репортажи</a>
        </li>
        <li class="item">
          <a href="">#Личный опыт</a>
        </li>
        <li class="item">
          <a href="">#Общество</a>
        </li>
        <li class="item">
          <a href="">#Культура</a>
        </li>
        <li class="item">
          <a href="">#Теории</a>
        </li>
        <li class="item">
          <a href="">#Поэзия</a>
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
