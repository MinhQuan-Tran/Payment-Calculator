import type { Entry } from '@/types';

export function currencyFormat(value: number): string {
  return Intl.NumberFormat([], {
    style: 'currency',
    currency: 'AUD'
  }).format(value);
}

export function hourFormat(hours: number): string {
  return Intl.NumberFormat([], {
    style: 'unit',
    unit: 'hour',
    maximumFractionDigits: 2
  }).format(hours);
}

export function toTimeStr(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    timeStyle: 'short'
  });
}

export function getEntryWorkHours(entry: Entry, fromLimit?: Date, toLimit?: Date): number {
  const fromDate = fromLimit && entry.from < fromLimit ? fromLimit : new Date(entry.from);
  const toDate = toLimit && entry.to > toLimit ? toLimit : new Date(entry.to);

  const workTime = toDate.getTime() - fromDate.getTime();
  const workHours = workTime / (1000 * 60 * 60);

  return workHours;
}
