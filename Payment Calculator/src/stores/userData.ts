import { defineStore } from 'pinia';
import type { Entry } from '@/types';

export const useUserDataStore = defineStore('userData', {
  state: () => ({
    entries: (localStorage.getItem('entries')
      ? JSON.parse(localStorage.getItem('entries')!)
      : []) as Entry[],

    checkInTime: (localStorage.getItem('checkInTime')
      ? new Date(localStorage.getItem('checkInTime')!)
      : undefined) as Date | undefined
  }),

  actions: {
    saveToLocalStorage(key: string, value: any) {
      if (value === undefined) {
        localStorage.removeItem(key);
      } else {
        switch (key) {
          case 'entries':
            localStorage.setItem(key, JSON.stringify(value));
            break;
          case 'checkInTime':
            localStorage.setItem(key, value.toISOString());
            break;
        }
      }
    },

    handleStorageChange(event: any) {
      console.log('Storage change', event.key, event.newValue, event.oldValue, event);
      switch (event.key) {
        case 'entries':
          this.entries = event.newValue ? JSON.parse(event.newValue) : [];
          break;

        case 'checkInTime':
          this.checkInTime = !isNaN(Date.parse(event.newValue))
            ? new Date(event.newValue)
            : undefined;
          break;
      }
    }
  }
});
