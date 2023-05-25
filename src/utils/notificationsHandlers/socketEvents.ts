import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket

  constructor() {
    this.socket = io('http://localhost:8000') // TODO replace
  }

  public subscribeToEvent(eventName: string, callback: Function): void {
    this.socket.on(eventName, (data) => callback(data))
  }

  public unsubscribeFromEvent(eventName: string): void {
    this.socket.off(eventName)
  }
}

export default new SocketService()
