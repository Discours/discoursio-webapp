import '../../styles/help.scss'
import { createSignal, onMount } from 'solid-js'
import { showModal, warn } from '../../stores/ui'
import { t } from '../../utils/intl'

export const Donate = () => {
  const once = ''
  const monthly = 'Monthly'
  const cpOptions = {
    publicId: 'pk_0a37bab30ffc6b77b2f93d65f2aed',
    description: t('Help discours to grow'),
    currency: 'RUB'
  }

  let amountSwitchElement: HTMLDivElement | undefined
  let customAmountElement: HTMLInputElement | undefined
  const [widget, setWidget] = createSignal()
  const [customerReciept, setCustomerReciept] = createSignal({})
  const [showingPayment, setShowingPayment] = createSignal<boolean>()
  const [period, setPeriod] = createSignal(monthly)
  const [amount, setAmount] = createSignal(0)

  onMount(() => {
    const {
      cp: { CloudPayments }
    } = window as any // Checkout(cpOptions)
    setWidget(new CloudPayments())
    console.log('[donate] payments initiated')
    setCustomerReciept({
      Items: [
        //товарные позиции
        {
          label: cpOptions.description, //наименование товара
          price: amount() || 0, //цена
          quantity: 1, //количество
          amount: amount() || 0, //сумма
          vat: 20, //ставка НДС
          method: 0, // тег-1214 признак способа расчета - признак способа расчета
          object: 0 // тег-1212 признак предмета расчета - признак предмета товара, работы, услуги, платежа, выплаты, иного предмета расчета
        }
      ],
      // taxationSystem: 0, //система налогообложения; необязательный, если у вас одна система налогообложения
      // email: 'user@example.com', //e-mail покупателя, если нужно отправить письмо с чеком
      // phone: '', //телефон покупателя в любом формате, если нужно отправить сообщение со ссылкой на чек
      isBso: false, //чек является бланком строгой отчетности
      amounts: {
        electronic: amount(), // Сумма оплаты электронными деньгами
        advancePayment: 0, // Сумма из предоплаты (зачетом аванса) (2 знака после запятой)
        credit: 0, // Сумма постоплатой(в кредит) (2 знака после запятой)
        provision: 0 // Сумма оплаты встречным предоставлением (сертификаты, др. мат.ценности) (2 знака после запятой)
      }
    })
  })

  const show = () => {
    // $openModal = 'donate'
    setShowingPayment(true)
    console.log('[donate] clicked')
    const choice: HTMLInputElement | undefined | null =
      amountSwitchElement?.querySelector('input[type=radio]:checked')
    setAmount(Number.parseInt(customAmountElement?.value || choice?.value || '0'))
    console.log('[donate] input amount ' + amount)
    ;(widget() as any).charge(
      {
        // options
        ...cpOptions,
        amount: amount(),
        skin: 'classic',
        requireEmail: true,
        retryPayment: true,
        // invoiceId: '1234567', //номер заказа  (необязательно)
        // accountId: 'user@example.com', //идентификатор плательщика (обязательно для создания подписки)
        data: {
          CloudPayments: {
            CustomerReciept: customerReciept(),
            recurrent: {
              interval: period(), // local solid's signal
              period: 1, // internal widget's
              CustomerReciept: customerReciept() // чек для регулярных платежей
            }
          }
        }
      },
      (opts: any) => {
        // success
        // действие при успешной оплате
        console.debug('[donate] options', opts)
        showModal('thank')
      },
      function (reason: string, options: any) {
        // fail
        // действие при неуспешной оплате
        console.debug('[donate] options', options)
        warn({
          kind: 'error',
          body: reason,
          seen: false
        })
      }
    )
  }

  return (
    <>
      <form class="discours-form donate-form" action="" method="post">
        <input type="hidden" name="shopId" value="156465" />
        <input value="148805" name="scid" type="hidden" />
        <input value="0" name="customerNumber" type="hidden" />

        <div class="form-group">
          <div class="donate-buttons-container" ref={amountSwitchElement}>
            <input type="radio" name="amount" id="fix250" value="250" />
            <label for="fix250" class="btn donate-value-radio">
              250&thinsp;₽
            </label>
            <input type="radio" name="amount" id="fix500" value="500" checked />
            <label for="fix500" class="btn donate-value-radio">
              500&thinsp;₽
            </label>
            <input type="radio" name="amount" id="fix1000" value="1000" />
            <label for="fix1000" class="btn donate-value-radio">
              1000&thinsp;₽
            </label>
            <input
              class="form-control donate-input"
              required
              ref={customAmountElement}
              type="number"
              name="sum"
              placeholder="Другая сумма"
            />
          </div>
        </div>

        <div class="form-group" id="payment-type" classList={{ showing: showingPayment() }}>
          <div class="btn-group payment-choose" data-toggle="buttons">
            <input
              type="radio"
              autocomplete="off"
              id="once"
              name="once"
              onClick={() => setPeriod(once)}
              checked={period() === once}
            />
            <label for="once" class="btn payment-type" classList={{ active: period() === once }}>
              Единоразово
            </label>
            <input
              type="radio"
              autocomplete="off"
              id="monthly"
              name="monthly"
              onClick={() => setPeriod(monthly)}
              checked={period() === monthly}
            />
            <label for="monthly" class="btn payment-type" classList={{ active: period() === monthly }}>
              Ежемесячно
            </label>
          </div>
        </div>

        <div class="form-group">
          <a href={''} class="btn send-btn donate" onClick={show}>
            Помочь журналу
          </a>
        </div>
      </form>
    </>
  )
}
