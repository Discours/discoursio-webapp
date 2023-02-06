import styles from './FeedArticlePopup.module.scss'
import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'

type FeedArticlePopupProps = {
  title: string
  shareUrl?: string
  imageUrl: string
  description: string
} & Omit<PopupProps, 'children'>

export const getShareUrl = (params: { pathname?: string } = {}) => {
  if (typeof location === 'undefined') return ''
  const pathname = params.pathname ?? location.pathname
  return location.origin + pathname
}

export const FeedArticlePopup = (props: FeedArticlePopupProps) => {
  return (
    <Popup {...props} variant="tiny" popupCssClass={styles.feedArticlePopup}>
      <ul class="nodash">
        <li>
          <button role="button" onClick={() => {}}>
            Поделиться
          </button>
        </li>
        <li>
          <button role="button" onClick={() => {}}>
            Помочь редактировать
          </button>
        </li>
        <li>
          <button role="button" onClick={() => {}}>
            Пригласить экспертов
          </button>
        </li>
        <li>
          <button role="button" onClick={() => {}}>
            Подписаться на комментарии
          </button>
        </li>
        <li>
          <button role="button" onClick={() => {}}>
            Добавить в закладки
          </button>
        </li>
        <li>
          <button role="button" onClick={() => {}}>
            Пожаловаться
          </button>
        </li>
        <li>
          <button role="button" onClick={() => {}}>
            Получать уведомления
          </button>
        </li>
      </ul>
    </Popup>
  )
}
