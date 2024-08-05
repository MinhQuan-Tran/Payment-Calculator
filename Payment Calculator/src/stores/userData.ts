import { defineStore } from 'pinia';
import type { Entry, WorkInfos } from '@/types';

export const useUserDataStore = defineStore('userData', {
  state: () => ({
    entries: (localStorage.getItem('entries')
      ? JSON.parse(localStorage.getItem('entries')!, (key, value) => {
          if (key === 'from' || key === 'to') {
            return new Date(value);
          }
          return value;
        })
      : []) as Entry[],

    checkInTime: (localStorage.getItem('checkInTime') ? new Date(localStorage.getItem('checkInTime')!) : undefined) as
      | Date
      | undefined,

    prevWorkInfos: (localStorage.getItem('prevWorkInfos') &&
    !Array.isArray(JSON.parse(localStorage.getItem('prevWorkInfos')!))
      ? JSON.parse(localStorage.getItem('prevWorkInfos')!)
      : {}) as WorkInfos
  }),

  actions: {
    saveToLocalStorage(key: string, value: any) {
      if (value === undefined) {
        console.log('Removing ', key);
        localStorage.removeItem(key);
      } else {
        console.log('Saving ', key, value);
        localStorage.setItem(key, JSON.stringify(value));
      }
    },

    handleStorageChange(event: any) {
      console.log('Storage change detected', event.key, event.newValue, event.oldValue, event);
      if (import.meta.env.DEV) {
        (this as any)[event.key] = JSON.parse(event.newValue);
        console.log('Parsed value:', (this as any)[event.key]);
      } else {
        console.warn('Ay yo! Do not change storage manually, please. Reversing changes...');
      }
    }
  }
});
