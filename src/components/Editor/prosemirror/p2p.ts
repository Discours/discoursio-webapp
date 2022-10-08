import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { Awareness } from 'y-protocols/awareness'
import { WebrtcProvider } from 'y-webrtc'
import { Doc, XmlFragment } from 'yjs'
import type { Reaction } from '../../../graphql/types.gen'
import { setReactions } from '../../../stores/editor'

export const roomConnect = (room, username = '', keyname = 'collab'): [XmlFragment, WebrtcProvider] => {
  const ydoc = new Doc()
  const yarr = ydoc.getArray(keyname + '-reactions')
  const yXmlFragment = ydoc.getXmlFragment(keyname)
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

  yarr.observeDeep(() => {
    console.debug('yarray updated:', yarr.toArray())
    setReactions(yarr.toArray() as Reaction[])
  })

  if (Boolean(name) === false) {
    name = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      style: 'capital',
      separator: ' ',
      length: 2
    })
  }

  provider.awareness.setLocalStateField('user', { name })
  return [yXmlFragment, provider]
}
