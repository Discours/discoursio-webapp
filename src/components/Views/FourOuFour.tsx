import { t } from '../../utils/intl'
import Icon from '../Nav/Icon'
import '../../styles/FourOuFour.scss'

export const FourOuFourView = (_props) => {
  return (
    <div class="error-page-wrapper">
      <div class="error-page">
        <div class="container">
          <div class="row">
            <div class="col-sm-7 offset-sm-3">
              <a href="/" class="image-link">
                <img class="error-image" src="/error.svg" alt="error" width="auto" height="auto" />
              </a>
            </div>
          </div>
          <div class="row">
            <div class="col-md-2 col-sm-3 offset-sm-2 error-text-container">
              <div class="error-text">
                <div>{t('Error')}</div>
                <div class="big">404</div>
              </div>
            </div>
            <div class="col-sm-4 search-form-container">
              <div class="error-explain">
                <p>{t(`You've reached a non-existed page`)}</p>
                <p>{t('Try to find another way')}:</p>
                <form class="errorform pretty-form" action="/search" method="get">
                  <div class="pretty-form__item">
                    <input type="text" name="q" placeholder={t('Search')} id="search-field" />
                    <label for="search-field">{t('Search')}</label>
                    <button type="submit" class="search-submit">
                      <Icon name="search" />
                    </button>
                  </div>
                </form>
                <p class="text-center">
                  <a href="/">{t('Back to mainpage')}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
