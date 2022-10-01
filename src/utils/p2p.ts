import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { Awareness } from 'y-protocols/awareness'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'
import type { Reaction } from '../graphql/types.gen'

export const roomConnect = (room, keyname = 'reactions'): [Reaction[], WebrtcProvider] => {
  const ydoc = new Y.Doc()
  const yarray = ydoc.getArray(keyname)
  const webrtcOptions = {
    awareness: new Awareness(ydoc),
    filterBcConns: true,
    maxConns: 33,
    signaling: [
      // 'wss://signaling.discours.io',
      // 'wss://stun.l.google.com:19302',
      'wss://y-webrtc-signaling-eu.herokuapp.com',
      'wss://signaling.yjs.dev'
    ],
    peerOpts: {},
    password: ''
  }
  const provider = new WebrtcProvider(room, ydoc, webrtcOptions)
  const username = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    style: 'capital',
    separator: ' ',
    length: 2
  })

  provider.awareness.setLocalStateField('user', {
    name: username
  })
  const data = yarray.toArray() as Reaction[]
  return [data, provider]
}
