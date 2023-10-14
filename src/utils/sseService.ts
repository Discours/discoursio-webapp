export type EventData = {
  type: string
}

class SSEService {
  private eventSource: EventSource | null

  constructor() {
    this.eventSource = null
  }

  public connect(url: string): void {
    this.eventSource = new EventSource(url)
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  public subscribeToEvent(eventName: string, callback: (eventData: EventData) => void): void {
    if (this.eventSource) {
      this.eventSource.addEventListener(eventName, (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        callback(data)
      })
    }
  }
}

export default SSEService
