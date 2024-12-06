import type { Duration, Entry } from '@/types';

export function currencyFormat(value: number): string {
  return Intl.NumberFormat([], {
    style: 'currency',
    currency: 'AUD'
  }).format(value);
}

export function hourMinuteFormat(time: Duration, style: string = 'narrow'): string {
  return new Intl.DurationFormat([], {
    style: style,
    hoursDisplay: 'always'
  }).format(time);
}

export function toTimeStr(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    timeStyle: 'short'
  });
}

export function getWorkDuration(entry: Partial<Entry>, fromLimit?: Date, toLimit?: Date): Duration {
  if (!entry.from || !entry.to) {
    return undefined as unknown as Duration;
  }

  // If the entry is outside the limits, use the limits instead
  const fromDate = fromLimit && entry.from < fromLimit ? fromLimit : new Date(entry.from);
  const toDate = toLimit && entry.to > toLimit ? toLimit : new Date(entry.to);

  const workTime = toDate.getTime() - fromDate.getTime();

  const workHours = Math.floor(workTime / (1000 * 60 * 60));
  const workMinutes = Math.floor((workTime % (1000 * 60 * 60)) / (1000 * 60));

  return { hours: workHours, minutes: workMinutes } as Duration;
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
