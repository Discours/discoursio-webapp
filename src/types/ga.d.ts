// ga-gtag.d.ts
declare module 'ga-gtag';

type GtagCommand = 'config' | 'event' | 'set';

interface GtagConfigParams {
  send_page_view?: boolean;
  page_title?: string;
  page_path?: string;
  user_id?: string;
  [key: string]: any;
}

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
}

interface GtagSetParams {
  [key: string]: any;
}

interface Gtag {
  (command: 'config', targetId: string, config?: GtagConfigParams): void;
  (command: 'event', eventName: string, eventParams?: GtagEventParams): void;
  (command: 'set', params: GtagSetParams): void;
  (...args: any[]): void;
}

declare global {
  interface Window {
    gtag: Gtag;
  }
}

export { Gtag };
