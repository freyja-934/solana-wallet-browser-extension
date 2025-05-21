// Type definitions for Chrome extension APIs

interface ChromeMessage {
  type: string;
  [key: string]: unknown;
}

interface ChromeResponse {
  [key: string]: unknown;
}

interface ChromeStorage {
  local: {
    get: (keys: string | string[] | object | null, callback: (items: { [key: string]: unknown }) => void) => void;
    set: (items: object, callback?: () => void) => void;
    remove: (keys: string | string[], callback?: () => void) => void;
    clear: (callback?: () => void) => void;
  };
  sync: {
    get: (keys: string | string[] | object | null, callback: (items: { [key: string]: unknown }) => void) => void;
    set: (items: object, callback?: () => void) => void;
    remove: (keys: string | string[], callback?: () => void) => void;
    clear: (callback?: () => void) => void;
  };
}

interface ChromeRuntime {
  id: string;
  onInstalled: {
    addListener: (callback: (details: { reason: string; id?: string; previousVersion?: string; }) => void) => void;
  };
  onMessage: {
    addListener: (callback: (message: ChromeMessage, sender: unknown, sendResponse: (response?: ChromeResponse) => void) => void) => void;
  };
  sendMessage: (message: ChromeMessage, callback?: (response: ChromeResponse) => void) => void;
}

interface Chrome {
  runtime: ChromeRuntime;
  storage: ChromeStorage;
}

declare const chrome: Chrome; 