import { clsx } from 'clsx'
import { createMemo, For } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { Icon } from '../_shared/Icon'
import { Subscribe } from '../_shared/Subscribe'

import styles from './Footer.module.scss'

export const Footer = () => {
  const { t, lang } = useLocalize()

  const changeLangTitle = createMemo(() => (lang() === 'ru' ? 'English' : 'Русский'))
  const changeLangLink = createMemo(() => `?lng=${lang() === 'ru' ? 'en' : 'ru'}`)
  const links = createMemo(() => [
    {
      header: 'About the project',
      items: [
        {
          title: 'Discours Manifest',
          slug: '/about/manifest',
        },
        {
          title: 'How it works',
          slug: '/about/guide',
        },
        {
          title: 'Dogma',
          slug: '/about/dogma',
        },
        {
          title: 'Principles',
          slug: '/about/principles',
        },
        {
          title: 'How to write an article',
          slug: '/how-to-write-a-good-article',
        },
      ],
    },

    {
      header: 'Participating',
      items: [
        {
          title: 'Suggest an idea',
          slug: '/connect',
        },
        {
          title: 'Become an author',
          slug: '/create',
        },
        {
          title: 'Support Discours',
          slug: '/about/help',
        },
        {
          title: 'Work with us',
          slug: 'https://docs.google.com/forms/d/e/1FAIpQLSeNNvIzKlXElJtkPkYiXl-jQjlvsL9u4-kpnoRjz1O8Wo40xQ/viewform',
        },
      ],
    },

    {
      header: 'Sections',
      items: [
        {
          title: 'Authors',
          slug: '/authors',
        },
        {
          title: 'Communities',
          slug: '/community',
        },
        {
          title: 'Partners',
          slug: '/about/partners',
        },
        {
          title: 'Special projects',
          slug: '/about/projects',
        },
        {
          title: changeLangTitle(),
          slug: changeLangLink(),
          rel: 'external',
        },
      ],
    },
  ])

  const SOCIAL = [
    {
      name: 'facebook',
      href: 'https://facebook.com/discoursio',
    },
    {
      name: 'vk',
      href: 'https://vk.com/discoursio',
    },
    {
      name: 'twitter',
      href: 'https://twitter.com/discours_io',
    },
    {
      name: 'telegram',
      href: 'https://t.me/discoursio',
    },
  ]
  return (
    <footer class={styles.discoursFooter}>
      <div class="wide-container">
        <div class="row">
          <For each={links()}>
            {({ header, items }) => (
              <div class="col-sm-8 col-md-6">
                <h5>{t(header)}</h5>
                <ul>
                  <For each={items}>
                    {({ slug, title, ...rest }) => (
                      <li>
                        {' '}
                        <a href={slug} {...rest}>
                          {slug.startsWith('?') ? title : t(title)}
                        </a>{' '}
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
          <div class="col-md-6">
            <h5>{t('Subscription')}</h5>
            <p>{t('Join our maillist')}</p>
            <Subscribe />
          </div>
        </div>

        <div class={clsx(styles.footerCopyright, 'row')}>
          <div class="col-md-18 col-lg-20">
            {t(
              'Independant magazine with an open horizontal cooperation about culture, science and society',
            )}
            . {t('Discours')} &copy; 2015&ndash;{new Date().getFullYear()}{' '}
            <a href="/about/terms-of-use">{t('Terms of use')}</a>
          </div>
          <div class={clsx(styles.footerCopyrightSocial, 'col-md-6 col-lg-4')}>
            <For each={SOCIAL}>
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
