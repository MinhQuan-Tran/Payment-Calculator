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

// Entry duration (including breaks)
export function entryDuration(entry: Pick<Entry, 'from' | 'to'>, fromLimit?: Date, toLimit?: Date): Duration {
  // If the entry is outside the limits, use the limits instead
  const fromDate = fromLimit && entry.from < fromLimit ? fromLimit : new Date(entry.from);
  const toDate = toLimit && entry.to > toLimit ? toLimit : new Date(entry.to);

  const workTime = toDate.getTime() - fromDate.getTime();

  const workHours = Math.floor(workTime / (1000 * 60 * 60));
  const workMinutes = Math.floor((workTime % (1000 * 60 * 60)) / (1000 * 60));

  return { hours: workHours, minutes: workMinutes } as Duration;
}

// Work duration (excluding breaks)
export function entryBillableTime(
  entry: Pick<Entry, 'from' | 'to' | 'unpaidBreaks'>,
  fromLimit?: Date,
  toLimit?: Date
): Duration {
  const entryTime = entryDuration(entry, fromLimit, toLimit);
  const breakTime = sumDuration(entry.unpaidBreaks);

  const billableTimeInMinutes = entryTime.hours * 60 + entryTime.minutes - (breakTime.hours * 60 + breakTime.minutes);

  return {
    hours: Math.floor(billableTimeInMinutes / 60),
    minutes: billableTimeInMinutes % 60
  };
}

export function entryTotalPay(entry: Entry) {
  const hours = entryBillableTime(entry).hours + entryBillableTime(entry).minutes / 60;
  return entry.payRate * hours;
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

export function sumDuration(durations: Duration[]): Duration {
  const totalMinutes =
    durations?.reduce((acc, duration) => {
      return acc + duration.hours * 60 + duration.minutes;
    }, 0) ?? 0;

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  };
}

export function deepClone<T>(obj: T, hash = new WeakMap()): T {
  // Handle null, undefined, and primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle circular references
  if (hash.has(obj)) {
    return hash.get(obj) as T;
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const clonedArr: any[] = [];
    hash.set(obj, clonedArr);
    obj.forEach((item, index) => {
      clonedArr[index] = deepClone(item, hash);
    });
    return clonedArr as T;
  }

  // Handle Map
  if (obj instanceof Map) {
    const clonedMap = new Map();
    hash.set(obj, clonedMap);
    obj.forEach((value, key) => {
      clonedMap.set(key, deepClone(value, hash));
    });
    return clonedMap as T;
  }

  // Handle Set
  if (obj instanceof Set) {
    const clonedSet = new Set();
    hash.set(obj, clonedSet);
    obj.forEach((value) => {
      clonedSet.add(deepClone(value, hash));
    });
    return clonedSet as T;
  }

  // Handle Object (including objects created with custom constructors)
  const clonedObj: any = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, clonedObj);

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone((obj as any)[key], hash);
    }
  }

  return clonedObj as T;
}
