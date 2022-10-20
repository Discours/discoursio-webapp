import { createMemo, For } from 'solid-js'
import styles from './Footer.module.scss'
import { Icon } from '../Nav/Icon'
import Subscribe from './Subscribe'
import { t } from '../../utils/intl'
import { locale } from '../../stores/ui'
import {clsx} from "clsx";

export const Footer = () => {
  const locale_title = createMemo(() => (locale() === 'ru' ? 'English' : 'Русский'))
  const locale_link = createMemo(() => '?lang=' + (locale() === 'ru' ? 'en' : 'ru'))
  const links = createMemo(() => [
    {
      header: 'About the project',
      items: [
        {
          title: 'Manifest',
          slug: '/about/manifest'
        },
        {
          title: 'How it works',
          slug: '/about/guide'
        },
        {
          title: 'Dogma',
          slug: '/about/dogma'
        },
        {
          title: 'Terms of use',
          slug: '/about/terms-of-use'
        },
        {
          title: 'How to write an article',
          slug: '/how-to-write-a-good-article'
        }
      ]
    },

    {
      header: 'Participating',
      items: [
        {
          title: 'Suggest an idea',
          slug: '/connect'
        },
        {
          title: 'Become an author',
          slug: '/create'
        },
        {
          title: 'Support us',
          slug: '/about/help'
        },
        {
          title: 'Feedback',
          slug: '/#feedback'
        },
        {
          title: 'Work with us',
          slug: 'https://docs.google.com/forms/d/e/1FAIpQLSeNNvIzKlXElJtkPkYiXl-jQjlvsL9u4-kpnoRjz1O8Wo40xQ/viewform'
        }
      ]
    },

    {
      header: 'Sections',
      items: [
        {
          title: 'Authors',
          slug: '/authors'
        },
        {
          title: 'Communities',
          slug: '/community'
        },
        {
          title: 'Partners',
          slug: '/about/partners'
        },
        {
          title: 'Special projects',
          slug: '/about/projects'
        },
        {
          title: locale_title(),
          slug: locale_link()
        }
      ]
    }
  ])

  const SOCIAL = [
    {
      name: 'facebook',
      href: 'https://facebook.com/discoursio'
    },
    {
      name: 'vk',
      href: 'https://vk.com/discoursio'
    },
    {
      name: 'twitter',
      href: 'https://twitter.com/discours_io'
    },
    {
      name: 'telegram',
      href: 'https://t.me/discoursio'
    }
  ]
  return (
    <footer class={styles.discoursFooter}>
      <div class={clsx('wide-container', styles.wideContainer)}>
        <div class="row">
          <For each={links()}>
            {({ header, items }) => (
              <div class="col-sm-4 col-md-3">
                <h5>{t(header)}</h5>
                <ul>
                  <For each={items}>
                    {({ slug, title }) => (
                      <li>
                        {' '}
                        <a href={slug}>{slug.startsWith('?') ? title : t(title)}</a>{' '}
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
          <div class="col-md-3">
            <h5>{t('Subscription')}</h5>
            <p>{t('Join our maillist')}</p>
            <Subscribe />
          </div>
        </div>

        <div class={clsx(styles.footerCopyright, 'row')}>
          <div class="col-md-9 col-lg-10">
            Независимый журнал с&nbsp;открытой горизонтальной редакцией о&nbsp;культуре, науке
            и&nbsp;обществе. Дискурс&nbsp;&copy; 2015&ndash;2022{' '}
            <a href="/about/terms-of-use">{t('Terms of use')}</a>
          </div>
          <div class={clsx(styles.footerCopyrightSocial, 'col-md-3 col-lg-2')}>
            <For each={[...SOCIAL]}>
              {(social) => (
                <div class={clsx(styles.socialItem, styles[`socialItem${social.name}`])}>
                  <a href={social.href}>
                    <Icon name={`${social.name}-white`} class={styles.icon} />
                  </a>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </footer>
  )
}
