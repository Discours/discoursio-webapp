import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { Awareness } from 'y-protocols/awareness'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'
// import type { Reaction } from '../graphql/types.gen'

export const roomConnect = (
  room,
  username = '',
  keyname = 'reactions'
): [Y.XmlFragment, WebrtcProvider] => {
  const ydoc = new Y.Doc()
  const yxmlfrag = ydoc.getXmlFragment(keyname) // TODO: encode/decode payload to Reactions[]
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
  let name = username

  if (Boolean(name) === false) {
    name = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      style: 'capital',
      separator: ' ',
      length: 2
    })
  }

  provider.awareness.setLocalStateField('user', { name })
  return [yxmlfrag, provider]
}
