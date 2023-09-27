import { Accessor, createMemo } from 'solid-js'
import { useLocalize } from '../context/localize'

// unix timestamp in seconds
const formattedTime = (time: number): Accessor<string> => {
  // FIXME: maybe it's better to move it from here
  const { lang } = useLocalize()

  return createMemo<string>(() => {
    return new Date(time).toLocaleTimeString(lang(), {
      hour: 'numeric',
      minute: 'numeric'
    })
  })
}

export default formattedTime
