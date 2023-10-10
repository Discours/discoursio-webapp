import { clsx } from 'clsx'
import styles from './Expo.module.scss'
import { Shout } from '../../../graphql/types.gen'
import { For } from 'solid-js'
import { ArticleCard } from '../../Feed/ArticleCard'

type Props = {
  shouts: Shout[]
}

export const Expo = (props: Props) => {
  return (
    <div class={styles.Expo}>
      <div class="wide-container">
        <div class="row">
          <For each={props.shouts}>
            {(shout) => (
              <div class="col-md-8">
                <ArticleCard
                  article={shout}
                  settings={{ nodate: true, nosubtitle: true, noAuthorLink: true }}
                />
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
