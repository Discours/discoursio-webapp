import { Meta } from '@solidjs/meta'

import { Feedback } from '../../../components/Discours/Feedback'
import { Modal } from '../../../components/Nav/Modal'
import Opener from '../../../components/Nav/Modal/Opener'
import { StaticPage } from '../../../components/Views/StaticPage'
import { Subscribe } from '../../../components/_shared/Subscribe'
import { useLocalize } from '../../../context/localize'
import { getImageUrl } from '../../../utils/getImageUrl'

export const ManifestPage = () => {
  const { t } = useLocalize()

  const ogImage = getImageUrl('production/image/logo_image.png')
  const ogTitle = t('Discours Manifest')
  const description = t(
    'Manifest of samizdat: principles and mission of an open magazine with a horizontal editorial board'
  )

  return (
    <StaticPage title={ogTitle}>
      <>
        <Modal variant="wide" name="feedback">
          <Feedback />
        </Modal>
        <Modal variant="wide" name="subscribe">
          <Subscribe />
        </Modal>
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

        <h1 id="manifest">
          <span class="wrapped">Манифест</span>
        </h1>

        <p>
          Дискурс&nbsp;&mdash; независимый художественно-аналитический журнал с&nbsp;горизонтальной
          редакцией, основанный на&nbsp;принципах свободы слова, прямой демократии и&nbsp;совместного
          редактирования. Дискурс создаётся открытым медиасообществом ученых, журналистов, музыкантов,
          писателей, предпринимателей, философов, инженеров, художников и&nbsp;специалистов со&nbsp;всего
          мира, объединившихся, чтобы вместе делать общий журнал и&nbsp;объяснять с&nbsp;разных точек зрения
          мозаичную картину современности.
        </p>
        <p>
          Мы&nbsp;пишем о&nbsp;культуре, науке и&nbsp;обществе, рассказываем о&nbsp;новых идеях
          и&nbsp;современном искусстве, публикуем статьи, исследования, репортажи, интервью людей, чью
          прямую речь стоит услышать, и&nbsp;работы художников из&nbsp;разных стран&nbsp;&mdash;
          от&nbsp;фильмов и&nbsp;музыки до&nbsp;живописи и&nbsp;фотографии. Помогая друг другу делать
          публикации качественнее и&nbsp;общим голосованием выбирая лучшие материалы для журнала,
          мы&nbsp;создаём новую горизонтальную журналистику, чтобы честно рассказывать о&nbsp;важном
          и&nbsp;интересном.
        </p>
        <p>
          Редакция Дискурса открыта для всех: у&nbsp;нас нет цензуры, запретных тем и&nbsp;идеологических
          рамок. Каждый может <a href="/create">прислать материал</a> в&nbsp;журнал и&nbsp;
          <a href="/about/guide">присоединиться к&nbsp;редакции</a>. Предоставляя трибуну для независимой
          журналистики и&nbsp;художественных проектов, мы&nbsp;помогаем людям рассказывать свои истории так,
          чтобы они были услышаны. Мы&nbsp;убеждены: чем больше голосов будет звучать на&nbsp;Дискурсе, тем
          громче в&nbsp;полифонии мнений будет слышна истина.
        </p>

        <h2 class="h2" id="participation">
          <span class="wrapped">Как участвовать в&nbsp;самиздате</span>
        </h2>

        <p>
          Дискурс создается <a href="/about/guide">открытым сообществом</a> энтузиастов новой независимой
          журналистики. Участвовать в&nbsp;открытой редакции и&nbsp;помогать журналу можно следующими
          способами:
        </p>
        <details open>
          <summary>
            <h3 id="contribute">Предлагать материалы</h3>
          </summary>
          <p>
            <a href="/create">Создавайте</a> свои статьи и&nbsp;художественные работы&nbsp;&mdash; лучшие из
            них будут опубликованы в&nbsp;журнале. Дискурс&nbsp;&mdash; некоммерческое издание, авторы
            публикуются в&nbsp;журнале на&nbsp;общественных началах, получая при этом{' '}
            <a href="/create?collab=true">поддержку</a> редакции, право голоса, множество других
            возможностей и&nbsp;читателей по&nbsp;всему миру.
          </p>
        </details>

        <details>
          <summary>
            <h3 id="donate">Поддерживать проект</h3>
          </summary>
          <p>
            Дискурс существует на&nbsp;пожертвования читателей. Если вам нравится журнал, пожалуйста,{' '}
            <a href="/about/help">поддержите</a> нашу работу. Ваши пожертвования пойдут на&nbsp;выпуск новых
            материалов, оплату серверов, труда программистов, дизайнеров и&nbsp;редакторов.
          </p>
        </details>

        <details>
          <summary>
            <h3 id="cooperation">Сотрудничать с&nbsp;журналом</h3>
          </summary>
          <p>
            Мы всегда открыты для сотрудничества и&nbsp;рады единомышленникам. Если вы хотите помогать
            журналу с&nbsp;редактурой, корректурой, иллюстрациями, переводами, версткой, подкастами,
            мероприятиями, фандрайзингом или как-то ещё&nbsp;&mdash; скорее пишите нам на&nbsp;
            <a href="mailto:welcome@discours.io">welcome@discours.io</a>.
          </p>
          <p>
            Если вы представляете некоммерческую организацию и&nbsp;хотите сделать с&nbsp;нами совместный
            проект, получить информационную поддержку или предложить другую форму
            сотрудничества&nbsp;&mdash; <a href="mailto:welcome@discours.io">пишите</a>.
          </p>
          <p>
            Если вы разработчик и&nbsp;хотите помогать с&nbsp;развитием сайта Дискурса,{' '}
            <a href="mailto:services@discours.io">присоединяйтесь к&nbsp;IT-команде самиздата</a>. Открытый
            код платформы для независимой журналистики, а&nbsp;также всех наших спецпроектов
            и&nbsp;медиаинструментов находится{' '}
            <a href="https://github.com/Discours">в&nbsp;свободном доступе на&nbsp;GitHub</a>.
          </p>
        </details>

        <details>
          <summary>
            <h3 id="follow">Как еще можно помочь</h3>
          </summary>
          <p>
            Советуйте Дискурс друзьям и&nbsp;знакомым. Обсуждайте и&nbsp;распространяйте наши
            публикации&nbsp;&mdash; все материалы открытой редакции можно читать и&nbsp;перепечатывать
            бесплатно. Подпишитесь на&nbsp;самиздат <a href="https://vk.com/discoursio">ВКонтакте</a>,
            в&nbsp;
            <a href="https://facebook.com/discoursio">Фейсбуке</a> и&nbsp;в&nbsp;
            <a href="https://t.me/discoursio">Телеграме</a>, а&nbsp;также на&nbsp;
            <Opener name="subscribe">рассылку лучших материалов</Opener>, чтобы не&nbsp;пропустить ничего
            интересного.
          </p>
          <p>
            <a href="https://forms.gle/9UnHBAz9Q3tjH5dAA">Рассказывайте о&nbsp;впечатлениях</a>{' '}
            от&nbsp;материалов открытой редакции, <Opener name="feedback">делитесь идеями</Opener>,
            интересными темами, о&nbsp;которых хотели бы узнать больше, и&nbsp;историями, которые нужно
            рассказать.
          </p>
        </details>

        <h2 class="h2" id="connection">
          <span class="wrapped">Будем на&nbsp;связи</span>
        </h2>

        <p>
          Если вы хотите предложить материал, сотрудничать, рассказать о&nbsp;проблеме, которую нужно
          осветить, сообщить об&nbsp;ошибке или баге, что-то обсудить, уточнить или посоветовать,
          пожалуйста, <Opener name="feedback">напишите нам здесь</Opener> или на&nbsp;почту{' '}
          <a href="mailto:welcome@discours.io">welcome@discours.io</a>. Мы обязательно ответим
          и&nbsp;постараемся реализовать все хорошие задумки.
        </p>
      </>
    </StaticPage>
  )
}

export const Page = ManifestPage
