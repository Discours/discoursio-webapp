/**
 * SSEService class
 * example:
  import SSEService from './sseService';
  const sseService = new SSEService();
  sseService.connect("http://localhost:8000/events");
  sseService.subscribeToEvent('someEvent', (data) => {
      console.log(data);
  });

  sseService.disconnect();
 */

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

  public subscribeToEvent(eventName: string, callback: Function): void {
    if (this.eventSource) {
      this.eventSource.addEventListener(eventName, (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        callback(data)
      })
    }
  }
}

export default SSEService
