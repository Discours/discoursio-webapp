import { A } from '@solidjs/router'
import { clsx } from 'clsx'
import { For } from 'solid-js'

import { ConditionalWrapper } from '~/components/_shared/ConditionalWrapper'
import { EXPO_LAYOUTS, EXPO_TITLES } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { ExpoLayoutType } from '~/types/common'

export const ExpoNav = (props: { layout: ExpoLayoutType | '' }) => {
  const { t } = useLocalize()
  return (
    <div class="wide-container">
      <ul class={clsx('view-switcher')}>
        <For each={[...EXPO_LAYOUTS, '']}>
          {(layoutKey) => (
            <li class={clsx({ 'view-switcher__item--selected': props.layout === layoutKey })}>
              <ConditionalWrapper
                condition={props.layout !== layoutKey}
                wrapper={(children) => <A href={`/expo/${layoutKey}`}>{children}</A>}
              >
                <span class="linkReplacement">
                  {layoutKey in EXPO_TITLES ? t(EXPO_TITLES[layoutKey as ExpoLayoutType]) : t('All')}
                </span>
              </ConditionalWrapper>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}

export default ExpoNav
