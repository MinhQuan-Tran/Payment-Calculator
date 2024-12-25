import type { Duration, Entry } from '@/classes';

export function currencyFormat(value: number): string {
  return Intl.NumberFormat([], {
    style: 'currency',
    currency: 'AUD'
  }).format(value);
}

export function toTimeStr(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    timeStyle: 'short'
  });
}

export function getEntries(entries: Array<Entry>, from: Date, to: Date): Entry[] {
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
