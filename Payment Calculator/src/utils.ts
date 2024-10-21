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

export function getWorkHours(entry: Entry, fromLimit?: Date, toLimit?: Date): number {
  // If the entry is outside the limits, use the limits instead
  const fromDate = fromLimit && entry.from < fromLimit ? fromLimit : new Date(entry.from);
  const toDate = toLimit && entry.to > toLimit ? toLimit : new Date(entry.to);

  const workTime = toDate.getTime() - fromDate.getTime();
  const workHours = workTime / (1000 * 60 * 60);

  console.log(fromDate, toDate, workHours);

  return workHours;
}

export function getEntries(entries: Entry[], from: Date, to: Date): Entry[] {
  // Filter entries for the given date
  return entries.filter((entry) => {
    // Including the ones with 'from' in the past and 'to' in the future
    return (
      // 'from' is before the next day of the selected date
      new Date(entry.from) < to &&
      // 'to' is after the start of the selected date
      new Date(entry.to) > from
    );
  });
}
