import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { Awareness } from 'y-protocols/awareness'
import { WebrtcProvider } from 'y-webrtc'
import { Doc, XmlFragment } from 'yjs'
// import type { Reaction } from '../../../graphql/types.gen'
// import { setReactions } from '../../../stores/editor'

export const roomConnect = (room: string, username = '', keyname = 'collab'): [XmlFragment, WebrtcProvider] => {
  const ydoc = new Doc()
  // const yarr = ydoc.getArray(keyname + '-reactions')
  // TODO: use reactions
  // yarr.observeDeep(() => {
  //  console.debug('[p2p] yarray updated', yarr.toArray())
  //  setReactions(yarr.toArray() as Reaction[])
  // })
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
  // connect with provider
  const provider = new WebrtcProvider(room, ydoc, webrtcOptions)
  console.debug('[p2p] provider', provider)
  // setting username
  provider.awareness.setLocalStateField('user', {
    name:
      username ??
      uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        style: 'capital',
        separator: ' ',
        length: 2
      })
  })

  return [yXmlFragment, provider]
}
