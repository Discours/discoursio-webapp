import { t } from '../../utils/intl'
import Icon from '../Nav/Icon'

export const FourOuFour = (_props) => {
  return (
    <div class="error-page-wrapper">
      <div class="error-page">
        <div class="container">
          <div class="row">
            <a href="/">
              <img class="error-image" src="/error.svg" alt="error" width="auto" height="auto" />
            </a>
          </div>
          <div class="row">
            <div class="col-md-2 col-sm-3 col-sm-offset-2">
              <div class="error-text">
                <div>{t('Empty')}</div>
                <div class="big ng-binding">404</div>
              </div>
            </div>
            <div class="col-sm-4">
              <div class="error-explain">
                <p class="text-left">{t(`You've reached a non-existed page`)}</p>
                <p class="text-left">{t('Try to find another way')}:</p>
                <form class="errorform ng-pristine ng-valid" action="/search" method="get">
                  <div class="discours-form">
                    <div class="form-group">
                      <a class="col-sm-2">
                        <Icon name="search" />
                      </a>
                    </div>
                  </div>
                </form>
                <p class="text-center">
                  <a class="black-link" href="/">
                    {t('Back to mainpage')}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
