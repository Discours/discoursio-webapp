import styles from './FeedArticlePopup.module.scss'
import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'
import { t } from '../../utils/intl'

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
          <button
            role="button"
            onClick={() => {
              alert('Share')
            }}
          >
            {t('Share')}
          </button>
        </li>
        <li>
          <button
            role="button"
            onClick={() => {
              alert('Help to edit')
            }}
          >
            {t('Help to edit')}
          </button>
        </li>
        <li>
          <button
            role="button"
            onClick={() => {
              alert('Invite experts')
            }}
          >
            {t('Invite experts')}
          </button>
        </li>
        <li>
          <button
            role="button"
            onClick={() => {
              alert('Subscribe to comments')
            }}
          >
            {t('Subscribe to comments')}
          </button>
        </li>
        <li>
          <button
            role="button"
            onClick={() => {
              alert('Add to bookmarks')
            }}
          >
            {t('Add to bookmarks')}
          </button>
        </li>
        <li>
          <button
            role="button"
            onClick={() => {
              alert('Report')
            }}
          >
            {t('Report')}
          </button>
        </li>
        <li>
          <button
            role="button"
            onClick={() => {
              alert('Get notifications')
            }}
          >
            {t('Get notifications')}
          </button>
        </li>
      </ul>
    </Popup>
  )
}
