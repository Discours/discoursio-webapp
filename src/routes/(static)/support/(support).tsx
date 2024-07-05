import { Meta } from '@solidjs/meta'
import { Donate } from '~/components/Discours/Donate'
import { StaticPage } from '~/components/Views/StaticPage'
import { useLocalize } from '~/context/localize'
import { getImageUrl } from '~/lib/getImageUrl'

export const SupportPage = () => {
  const { t } = useLocalize()

  const ogImage = getImageUrl('production/image/logo_image.png')
  const ogTitle = t('Support Discours')
  const description = t(
    'Contribute to free samizdat. Support Discours - an independent non-profit publication that works only for you. Become a pillar of the open newsroom'
  )

  return (
    <StaticPage title={ogTitle}>
      <>
        <Meta name="descprition" content={description} />
        <Meta name="keywords" content={t('keywords')} />
        <Meta name="og:type" content="article" />
        <Meta name="og:title" content={ogTitle} />
        <Meta name="og:image" content={ogImage} />
        <Meta name="twitter:image" content={ogImage} />
        <Meta name="og:description" content={description} />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:title" content={ogTitle} />
        <Meta name="twitter:description" content={description} />

        <h1 id="help-us">
          <span class="wrapped">Как вы&nbsp;можете поддержать Дискурс?</span>
        </h1>

        <p>
          Дискурс&nbsp;&mdash; уникальное независимое издание с&nbsp;горизонтальной редакцией, существующее
          в&nbsp;интересах своих читателей. Ваша поддержка действительно много значит&nbsp;&mdash;
          не&nbsp;только для редакции Дискурса, но&nbsp;и&nbsp;для сохранения свободной мысли
          и&nbsp;некоммерческого искусства в&nbsp;нашем обществе.
        </p>
        <p>
          Дискурс существует на&nbsp;добровольных началах. Никакой медиахолдинг, фонд или государственная
          структура не&nbsp;финансирует нас&nbsp;&mdash; благодаря этому мы&nbsp;можем писать о&nbsp;том,
          что важно, а&nbsp;не&nbsp;о&nbsp;том, что выгодно. Сообщество наших волонтеров ежедневно трудится,
          чтобы рассказывать вам интересные, не&nbsp;освещенные другими изданиями истории&nbsp;&mdash;
          но&nbsp;мы&nbsp;не&nbsp;сможем делать это без вашей помощи. Пожертвования читателей составляют
          основу нашего бюджета и&nbsp;позволяют нам существовать.
        </p>
        <p>
          Если вам нравится&nbsp;то, что мы&nbsp;делаем и&nbsp;вы&nbsp;хотите, чтобы Дискурс продолжался,
          пожалуйста, поддержите проект.
        </p>
        <div class="row">
          <div class="col-sm-22 col-md-24">
            <Donate />
          </div>
        </div>
        <h3 id="financial-report">На&nbsp;что пойдут деньги?</h3>
        <p>
          Ваши пожертвования пойдут на&nbsp;оплату серверов, содержание офиса, зарплату редакции
          и&nbsp;налоги, оплату юридического сопровождения и&nbsp;труда бухгалтера, совершенствование сайта,
          аренду помещения для открытой редакции, на&nbsp;печать альманаха Дискурс с&nbsp;лучшими текстами
          авторов за&nbsp;полгода, а&nbsp;также на&nbsp;другие редакционные и&nbsp;технические расходы.
        </p>
        <h3>Ваша помощь позволит нам</h3>
        <ul>
          <li>
            <h4>Оставаться бесплатным изданием.</h4>
            <p>
              Мы&nbsp;делаем открытый журнал для всех желающих, а&nbsp;также собираем искусство лучших
              авторов по&nbsp;всему миру. Ваша поддержка позволяет нам становиться лучше.
            </p>
          </li>
          <li>
            <h4>Создавать еще больше контента.</h4>
            <p>
              Каждый день к&nbsp;нам присоединяются новые люди, и&nbsp;чем больше нас становится, тем больше
              мы&nbsp;творим и&nbsp;строже оцениваем результаты творчества друг друга. В&nbsp;результате
              повышается и&nbsp;количество, и&nbsp;качество контента. Каждый день мы трудимся, чтобы
              открывать нашим читателям новые грани окружающего мира.
            </p>
          </li>
          <li>
            <h4>Развивать форматы и&nbsp;расширять деятельность Дискурса.</h4>
            <p>
              Мы&nbsp;создаем различные спецпроекты и&nbsp;регулярно проводим необычные мероприятия.
              Мы&nbsp;хотим приносить пользу человечеству всеми возможными способами.
            </p>
          </li>
          <li>
            <h4>Модернизировать сайт.</h4>
            <p>
              Мы&nbsp;совершенствуем платформу и&nbsp;стараемся сделать проект максимально удобным для вас.
              Мы&nbsp;работаем над мобильной версией, новым дизайном, фукционалом, системой регистрации,
              навигации и&nbsp;рекомендаций, которые сделают наше общение еще увлекательней.
            </p>
          </li>
          <li>
            <h4>Выпускать альманах.</h4>
            <p>
              Выпускать раз в&nbsp;полугодие печатный альманах Дискурс с&nbsp;33&nbsp;лучшими текстами
              сайта.
            </p>
          </li>
          <li>
            <h4>Захватить весь мир</h4>
            <p>и&nbsp;принести &laquo;Дискурс&raquo; в&nbsp;каждый дом.</p>
          </li>
        </ul>
        <h3 id="trustee">Войдите в&nbsp;попечительский совет Дискурса</h3>
        <p>
          Вы&nbsp;хотите сделать крупное пожертвование? Станьте попечителем Дискурса&nbsp;&mdash;{' '}
          <a class="black-link" href="mailto:welcome@discours.io" target="_blank" rel="noreferrer">
            напишите нам
          </a>
          , мы&nbsp;будем рады единомышленникам.
        </p>
        <h3 id="other">Как ещё можно поддержать Дискурс?</h3>
        <p>
          Есть много других способов поддержать Дискурс и&nbsp;труд наших авторов. Например, вы&nbsp;можете
          периодически рассказывать о&nbsp;проекте своим друзьям в&nbsp;соцсетях, делиться хорошими
          материалами или&nbsp;&mdash; что еще лучше&nbsp;&mdash; публиковать свои статьи
          в&nbsp;&laquo;Дискурсе&raquo;. Но&nbsp;главное, что вы&nbsp;можете сделать для Дискурса, &mdash;
          читать нас. Мы&nbsp;вкладываем в&nbsp;журнал душу, и&nbsp;внимание каждого читателя убеждает нас
          в&nbsp;правильности выбранного пути. Не&nbsp;переключайтесь.
        </p>
        <p>
          Если вы&nbsp;хотите помочь проекту, но&nbsp;у&nbsp;вас возникли вопросы, напишите нам письмо
          по&nbsp;адресу{' '}
          <a class="black-link" href="mailto:welcome@discours.io" target="_blank" rel="noreferrer">
            welcome@discours.io
          </a>
          .
        </p>
      </>
    </StaticPage>
  )
}

export default SupportPage
