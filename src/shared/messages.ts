export const MessageType = {
  GetCookies: 'GET_COOKIES',
  DeleteCookie: 'DELETE_COOKIE',
  GetLocalStorage: 'GET_LOCAL_STORAGE',
  DeleteLocalStorageItem: 'DELETE_LOCAL_STORAGE_ITEM',
  SetCookies: 'SET_COOKIES',
  SetLocalStorage: 'SET_LOCAL_STORAGE',
  UpdateCookieFields: 'UPDATE_COOKIE_FIELDS',
  UpdateLocalStorageValue: 'UPDATE_LOCAL_STORAGE_VALUE',
  RenameLocalStorageKey: 'RENAME_LOCAL_STORAGE_KEY',
  ClearAllData: 'CLEAR_ALL_DATA'
} as const;

export type MessageTypeValue = (typeof MessageType)[keyof typeof MessageType];

export interface ExtensionMessage {
  type: MessageTypeValue;
  payload?: Record<string, unknown>;
}
