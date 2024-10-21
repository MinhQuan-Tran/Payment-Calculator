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
      ? JSON.parse(localStorage.getItem('prevWorkInfos')!, (key, value) => {
          if (key === 'payRate' && value instanceof Array) {
            return new Set<number>(value.map((rate: number | string) => Number(rate)));
          }
          return value;
        })
      : {}) as WorkInfos
  }),

  actions: {
    fixState(key: string, value: any) {
      console.log('Fixing ', key);
      switch (key) {
        case 'entries':
          return value.map((entry: Entry) => ({
            ...entry,
            payRate: Number(entry.payRate),
            from: new Date(entry.from),
            to: new Date(entry.to)
          }));
        case 'checkInTime':
          return new Date(value);
        case 'prevWorkInfos':
          for (const workplace in value) {
            if (value[workplace].payRate instanceof Array) {
              value[workplace].payRate = new Set<number>([...value[workplace].payRate].map((rate) => Number(rate)));
            }
          }
      }
    },

    saveToLocalStorage(key: string, value: any) {
      if (value === undefined) {
        console.log('Removing ', key);
        localStorage.removeItem(key);
      } else {
        console.log('Saving ', key, value);
        localStorage.setItem(
          key,
          JSON.stringify(value, (_key, value) => (value instanceof Set ? [...value] : value))
        );
      }
    },

    handleStorageChange(event: any) {
      console.log(`Storage change detected: [${event.key}] ${event.oldValue} -> ${event.newValue}`, event);
      if (import.meta.env.DEV) {
        try {
          (this as any)[event.key] = JSON.parse(event.newValue);
          console.log('Parsed value:', (this as any)[event.key]);
        } catch (error) {
          console.error('Failed to parse value:', event.newValue);
        }
      } else {
        console.warn('Do not touch the storage, please. Reversing changes...');
      }
    }
  }
});
