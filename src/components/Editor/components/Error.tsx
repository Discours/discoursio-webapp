import { Switch, Match } from 'solid-js'
import '../styles/Button.scss'
import { ErrorObject, useState } from '../store/context'
import { t } from '../../../utils/intl'

export default () => {
  const [store] = useState()
  return (
    <Switch fallback={<Other />}>
      <Match when={store.error.id === 'invalid_state'}>
        <InvalidState title="Invalid State" />
      </Match>
      <Match when={store.error.id === 'invalid_config'}>
        <InvalidState title="Invalid Config" />
      </Match>
      <Match when={store.error.id === 'invalid_draft'}>
        <InvalidState title="Invalid Draft" />
      </Match>
    </Switch>
  )
}

const InvalidState = (props: { title: string }) => {
  const [store, ctrl] = useState()
  const onClick = () => ctrl.clean()

  return (
    <div class="error">
      <div class="container">
        <h1>{props.title}</h1>
        <p>
          {t('Editing conflict, please copy your notes and refresh page')}
        </p>
        <pre>
          <code>{JSON.stringify(store.error.props)}</code>
        </pre>
        <button class="primary" onClick={onClick}>
          {t('Clean')}
        </button>
      </div>
    </div>
  )
}

const Other = () => {
  const [store, ctrl] = useState()
  const onClick = () => ctrl.discard()

  const getMessage = () => {
    const err = (store.error.props as ErrorObject['props']).error
    return typeof err === 'string' ? err : err.message
  }

  return (
    <div class="error">
      <div class="container">
        <h1>An error occurred.</h1>
        <pre>
          <code>{getMessage()}</code>
        </pre>
        <button class="primary" onClick={onClick}>
          Close
        </button>
      </div>
    </div>
  )
}
