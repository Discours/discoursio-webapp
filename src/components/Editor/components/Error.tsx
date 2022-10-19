import { Switch, Match } from 'solid-js'
import { useState } from '../store/context'
import '../styles/Button.scss'

export default () => {
  const [store] = useState()
  return (
    <Switch fallback={<Other />}>
      <Match when={store.error.id === 'invalid_state'}>
        <InvalidState title='Invalid State' />
      </Match>
      <Match when={store.error.id === 'invalid_config'}>
        <InvalidState title='Invalid Config' />
      </Match>
      <Match when={store.error.id === 'invalid_file'}>
        <InvalidState title='Invalid File' />
      </Match>
    </Switch>
  )
}

const InvalidState = (props: { title: string }) => {
  const [store, ctrl] = useState()
  const onClick = () => ctrl.clean()

  return (
    <div class='error'>
      <div class='container'>
        <h1>{props.title}</h1>
        <p>
          There is an error with the editor state. This is probably due to an old version in which the data
          structure has changed. Automatic data migrations may be supported in the future. To fix this now,
          you can copy important notes from below, clean the state and paste it again.
        </p>
        <pre>
          <code>{JSON.stringify(store.error.props)}</code>
        </pre>
        <button class='primary' onClick={onClick}>
          Clean
        </button>
      </div>
    </div>
  )
}

const Other = () => {
  const [store, ctrl] = useState()
  const onClick = () => ctrl.discard()

  const getMessage = () => {
    const err = (store.error.props as any).error
    return typeof err === 'string' ? err : err.message
  }

  return (
    <div class='error'>
      <div class='container'>
        <h1>An error occurred.</h1>
        <pre>
          <code>{getMessage()}</code>
        </pre>
        <button class='primary' onClick={onClick}>
          Close
        </button>
      </div>
    </div>
  )
}
